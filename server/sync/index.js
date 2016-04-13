var redis = require('redis')
var IO = require('socket.io')
var adapter = require('socket.io-redis')
var redisConf = require('../../config/redis.js')
var jwt = require('jsonwebtoken')
var jwtKey = require('../../config/jwtKey.js')

function sanitizeUser (user) {
  return {
    name: user.name,
    id: user.id,
    username: user.username,
    actual: user.actual
  }
}

module.exports = function (server, db) {
  // todo: multithreaded/process support
  // investigate cluster vs webworker
  var io = IO.listen(server.listener)

  var pub = redis.createClient(redisConf.port, redisConf.host, { password: redisConf.password })
  var sub = redis.createClient(redisConf.port, redisConf.host, { return_buffers: true, password: redisConf.password })
  io.adapter(adapter({pubClient: pub, subClient: sub}))
  var sync = io.of('/api/sync')

  var anonId = 0
  // keep track of all rooms locally... for now.
  var rooms = []

  sync.on('connection', function (socket) {
    console.log('connection')
    // keep track of user who connected and the room they're in
    var user, roomId

    socket.on('joinRoom', function (data) {
      var entryData = data

      db.view('room/byName', { key: entryData.roomName }, function (err, doc) {
        if (err || !doc[0]) return socket.emit('kicked')
        if (doc[0]) {
          if (doc[0].type === 'private' || doc[0].type === 'membersOnly') {
            jwt.verify(entryData.token, jwtKey, function (err, decoded) {
              if (err || !decoded.email || !decoded.name) {
                socket.emit('kicked')
                socket.disconnect()
              }
              decoded.actual = true
              if (doc[0].type === 'private') {
                if (doc[0].invitedUsers.indexOf(decoded.id) > -1) {
                  user = sanitizeUser(decoded)
                  sendRoomDetails()
                } else {
                  socket.emit('kicked')
                  socket.disconnect()
                }
              } else {
                user = sanitizeUser(decoded)
                sendRoomDetails()
              }
            })
          } else {
            if (entryData.token) {
              jwt.verify(entryData.token, jwtKey, function (err, decoded) {
                if (err || !decoded.email || !decoded.name) {
                  // lets just put the user as anon?
                  anonId++
                  user = { name: 'anon' + anonId, username: 'anon' + anonId }
                } else {
                  user = sanitizeUser(decoded)
                  sendRoomDetails()
                }
              })
            } else {
              anonId++
              user = { name: 'anon' + anonId, username: 'anon' + anonId }
              sendRoomDetails()
            }
          }
        }

        function sendRoomDetails () {
          roomId = doc[0].id
          if (!rooms[roomId]) {
            rooms[roomId] = doc[0]
            rooms[roomId].connectedUsers = []
            // might already have a queue
            rooms[roomId].queue = rooms[roomId].queue || []
          }

          // before we add them, lets see if they already provided details,
          // and make sure they aren't trying to impersonate another
          if (entryData.details && !user.actual) {
            if (!rooms[roomId].connectedUsers.some((elem) => elem.name === entryData.details.name && elem.username === entryData.details.username)) {
              user = entryData.details
            }
          }

          // before forwarding the room data, add the newest user to the connected users
          if (!rooms[roomId].connectedUsers.some((elem) => elem.name === user.name && elem.username === user.username)) {
            rooms[roomId].connectedUsers.push(sanitizeUser(user))
          }

          // console.log('send details', rooms[roomId])
          socket.emit('connectionCredentials', sanitizeUser(user))
          socket.emit('roomDetails', rooms[roomId])
          sync.to(roomId).emit('userJoined', user)
          socket.join(roomId)
        }
      })
    })

    socket.on('disconnect', function () {
      if (!roomId || !rooms[roomId]) return
      console.log('user left')

      sync.to(roomId).emit('userLeft', sanitizeUser(user))

      var i = -1
      rooms[roomId].connectedUsers.some((elem, index) => {
        if (elem.name === user.name && elem.username === user.username) {
          i = index
          return true
        }
      })
      if (i > -1) rooms[roomId].connectedUsers.splice(i, 1)
    })

    socket.on('getData', () => socket.emit('roomDetails', rooms[roomId]))

    // change the playing time
    socket.on('setTime', (data) => sync.to(roomId).emit('setTime', data))

    // play, pause, skip & back
    socket.on('play', () => sync.to(roomId).emit('play'))

    socket.on('pause', () => sync.to(roomId).emit('pause'))

    socket.on('skip', function (id) {
      if (rooms[roomId].queue.length > 1 && id === rooms[roomId].queue[0].id) {
        rooms[roomId].queue.push(rooms[roomId].queue.shift())
      }
      sync.to(roomId).emit('skip', id)
      queueChanged(roomId)
    })

    socket.on('back', function (id) {
      if (rooms[roomId].queue.length > 1 && id === rooms[roomId].queue[0].id) {
        rooms[roomId].queue.unshift(rooms[roomId].queue.pop())
      }
      sync.to(roomId).emit('back', id)
      queueChanged(roomId)
    })

    socket.on('mediaOver', function (id) {
      if (rooms[roomId].queue.length > 1 && id === rooms[roomId].queue[0].id) {
        rooms[roomId].queue.push(rooms[roomId].queue.shift())
      }
      sync.to(roomId).emit('mediaOver', id)
    })

    socket.on('moveMedia', function (data) {
      var element = rooms[roomId].queue[data.oldIndex]
      rooms[roomId].queue.splice(data.oldIndex, 1)
      rooms[roomId].queue.splice(data.newIndex, 0, element)
      queueChanged(roomId)
      // TODO NOTIFY CONNECTED USERS
    })

    socket.on('deleteMedia', function (index) {
      rooms[roomId].queue.splice(index, 1)
      queueChanged(roomId)
      // TODO NOTIFY CONNECTED USERS
    })

    // hmmmmm...
    socket.on('addMedia', function (media) {
      // room.addSongToQueue(newId)
      // var i = room.getQueue().length - 1
      //
      // room.moveSong(i, 1)
      // queueChanged()
      // emitQueue()
    })

    socket.on('moveToFront', function (index) {
      var elem = rooms[roomId].queue[index]
      rooms[roomId].queue.splice(index, 1)
      rooms[roomId].queue.unshift(elem)
      queueChanged(roomId)
    })
  })

  function queueChanged (roomId) {
    db.merge(roomId, {queue: rooms[roomId].queue})
  }
}
