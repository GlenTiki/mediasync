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
    username: user.username
  }
}

module.exports = function (server, db) {
  // todo: multithreaded/process support
  // investigate cluster vs webworker
  var io = IO.listen(server.listener)
  var client = redis.createClient(redisConf.port, redisConf.host, { auth_pass: redisConf.password })
  io.adapter(adapter({pubClient: client, subClient: client}))

  var anonId = 0
  // keep track of all rooms locally... for now.
  var rooms = []

  io.on('connection', function (socket) {
    // keep track of user who connected and the room they're in
    var user, roomId

    socket.on('joinRoom', function (data) {
      var entryData = data

      db.view('room/byName', { key: entryData.roomName }, function (err, doc) {
        if (err || !doc[0]) return socket.emit('room doesnt exist')
        if (doc[0]) {
          if (doc[0].type === 'private' || doc[0].type === 'membersOnly') {
            jwt.verify(entryData.token, jwtKey, function (err, decoded) {
              if (err || !decoded.email || !decoded.name) {
                socket.emit('not signed in')
                socket.disconnect()
              }
              if (doc[0].type === 'private') {
                if (doc[0].invitedUsers.indexOf(decoded.id) > -1) {
                  user = decoded
                  sendRoomDetails()
                } else {
                  socket.emit('not permitted entry')
                  socket.disconnect()
                }
              } else {
                user = decoded
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
                  user = decoded
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
          if (!rooms[doc[0].id]) {
            rooms[doc[0].id] = doc[0]
            rooms[doc[0].id].connectedUsers = []
            rooms[doc[0].id].queue = []
          }

          // before forwarding the room data, add the newest user to the connected users
          rooms[doc[0].id].connectedUsers.push(sanitizeUser(user))

          roomId = doc[0].id

          socket.emit('roomDetails', rooms[roomId])
          io.to(roomId).emit('userJoined', user)
          socket.join(roomId)
        }
      })
    })

    socket.on('disconnect', function () {
      io.to(roomId).emit('userLeft', user)
      var i = rooms[roomId].connectedUsers.indexOf(sanitizeUser(user))
      if (i > -1) rooms[roomId].connectedUsers.splice(i, 1)
    })

    socket.on('getData', () => socket.emit('roomDetails', rooms[roomId]))

    // change the playing time
    socket.on('setTime', (data) => io.to(roomId).emit('setTime', data))

    // play, pause, skip & back
    socket.on('play', () => io.to(roomId).emit('play'))

    socket.on('pause', () => io.to(roomId).emit('pause'))

    socket.on('skip', function (id) {
      if (rooms[roomId].queue.length > 1 && id === rooms[roomId].queue[0].id) {
        rooms[roomId].queue.push(rooms[roomId].queue.shift())
      }
      io.to(roomId).emit('skip', id)
    })

    socket.on('back', function (id) {
      if (rooms[roomId].queue.length > 1 && id === rooms[roomId].queue[0].id) {
        rooms[roomId].queue.unshift(rooms[roomId].queue.pop())
      }
      io.to(roomId).emit('back', id)
    })

    socket.on('mediaOver', function (id) {
      if (rooms[roomId].queue.length > 1 && id === rooms[roomId].queue[0].id) {
        rooms[roomId].queue.push(rooms[roomId].queue.shift())
      }
      io.to(roomId).emit('mediaOver', id)
    })

    socket.on('moveMedia', function (data) {
      var element = rooms[roomId].queue[data.oldIndex]
      rooms[roomId].queue.splice(data.oldIndex, 1)
      rooms[roomId].queue.splice(data.newIndex, 0, element)
      // TODO NOTIFY CONNECTED USERS
    })

    socket.on('deleteMedia', function (index) {
      rooms[roomId].queue.splice(index, 1)
      // TODO NOTIFY CONNECTED USERS
    })

    // hmmmmm...
    socket.on('addMedia', function (media) {
      // room.addSongToQueue(newId)
      // var i = room.getQueue().length - 1
      //
      // room.moveSong(i, 1)
      // emitQueue()
    })

    socket.on('moveToFront', function (index) {
      var elem = rooms[roomId].queue[index]
      rooms[roomId].queue.splice(index, 1)
      rooms[roomId].queue.unshift(elem)
    })
  })
}
