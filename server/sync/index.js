var redis = require('redis')
var IO = require('socket.io')
var adapter = require('socket.io-redis')
var redisConf = require('../../config/redis.js')
var jwt = require('jsonwebtoken')
var request = require('superagent')
var jwtKey = require('../../config/jwtKey.js')
var youtubeKey = require('../../config/youtubeApiKey.js')
var vimeoKey = require('../../config/vimeoApiKey.js')

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
    var alreadyActive = false

    socket.on('joinRoom', function (data) {
      var entryData = data
      alreadyActive = data.alreadyActive || false

      db.view('room/byName', { key: entryData.roomName }, function (err, doc) {
        if (err || !doc[0]) return socket.emit('kicked')
        if (doc[0]) {
          if (doc[0].value.type === 'private' || doc[0].value.type === 'membersOnly') {
            jwt.verify(entryData.token, jwtKey, function (err, decoded) {
              if (err || !decoded.email || !decoded.name) {
                socket.emit('kicked')
                socket.disconnect()
                return
              }
              decoded.actual = true
              if (doc[0].value.type === 'private') {
                if (doc[0].value.invitedUsers.indexOf(decoded.id) > -1) {
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
            rooms[roomId] = doc[0].value
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
          console.log('emitting play on join', !rooms[roomId].connectedUsers.some((elem) => elem.name === user.name && elem.username === user.username))

          // before forwarding the room data, add the newest user to the connected users
          if (!rooms[roomId].connectedUsers.some((elem) => elem.name === user.name && elem.username === user.username)) {
            rooms[roomId].connectedUsers.push(sanitizeUser(user))

            setTimeout(function () {
              if (rooms[roomId].connectedUsers.length === 1 && rooms[roomId].queue[0] && !alreadyActive) {
                sync.to(roomId).emit('play', {id: rooms[roomId].queue[0].id, time: 0})
              }
            }, 2000)
          }

          // console.log('send details', rooms[roomId])
          user = sanitizeUser(user)
          socket.emit('connectionCredentials', sanitizeUser(user))
          socket.emit('roomDetails', rooms[roomId])
          sync.to(roomId).emit('userJoined', user)
          socket.join(roomId)
        }
      })
    })

    socket.on('disconnect', function () {
      console.log('user left')
      if (!roomId || !rooms[roomId]) return

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

    // play, pause, skip & back
    socket.on('play', function (data) {
      // console.log('play', data)
      console.log('play', data)
      if (rooms[roomId].playback !== 'anyone') {
        if (rooms[roomId].controllers.indexOf(user.id) > -1) {
          sync.to(roomId).emit('play', data)
        } else {
          socket.emit('pause', {time: data.time})
        }
      } else {
        sync.to(roomId).emit('play', data)
      }
    })

    socket.on('pause', function (data) {
      // console.log('pause', data)
      console.log('pause', data)
      if (rooms[roomId].playback !== 'anyone') {
        if (rooms[roomId].controllers.indexOf(user.id) > -1) {
          sync.to(roomId).emit('pause', data)
        } else {
          socket.emit('play', {time: data.time})
        }
      } else {
        sync.to(roomId).emit('pause', data)
      }
    })

    socket.on('skip', function (data) {
      console.log('skip', data)
      if (rooms[roomId].queue.length > 1 && data.id === rooms[roomId].queue[0].id) {
        if (rooms[roomId].playback !== 'anyone') {
          if (rooms[roomId].controllers.indexOf(user.id) > -1) {
            rooms[roomId].queue.push(rooms[roomId].queue.shift())
            sync.to(roomId).emit('skip', data)
            queueChanged(roomId)
          }
        } else {
          rooms[roomId].queue.push(rooms[roomId].queue.shift())
          sync.to(roomId).emit('skip', data)
          queueChanged(roomId)
        }
      }
    })

    socket.on('back', function (data) {
      console.log('back', data)
      if (rooms[roomId].queue.length > 1 && data.id === rooms[roomId].queue[0].id) {
        if (rooms[roomId].playback !== 'anyone') {
          if (rooms[roomId].controllers.indexOf(user.id) > -1) {
            rooms[roomId].queue.unshift(rooms[roomId].queue.pop())
            sync.to(roomId).emit('back', data)
            queueChanged(roomId)
          }
        } else {
          rooms[roomId].queue.unshift(rooms[roomId].queue.pop())
          sync.to(roomId).emit('back', data)
          queueChanged(roomId)
        }
      }
    })

    socket.on('ended', function (data) {
      if (rooms[roomId].queue.length > 1 && data.id === rooms[roomId].queue[0].id) {
        rooms[roomId].queue.push(rooms[roomId].queue.shift())
        sync.to(roomId).emit('skip', data)
        queueChanged(roomId)
      }
    })

    socket.on('timeChanged', function (data) {
      if (rooms[roomId].playback !== 'anyone') {
        if (rooms[roomId].controllers.indexOf(user.id) > -1) {
          sync.to(roomId).emit('timeChanged', data)
        }
      } else {
        sync.to(roomId).emit('timeChanged', data)
      }
    })

    socket.on('currentTime', function (data) {
      sync.to(roomId).emit('currentTime', data)
    })

    socket.on('search', function (data) {
      var search = data.search
      var searchLoc = data.searchLoc
      switch (searchLoc) {
        case 'youtube':
          youtubeSearch()
          break
        case 'vimeo':
          vimeoSearch()
          break
      }

      function youtubeSearch () {
        request
        .get('https://www.googleapis.com/youtube/v3/search')
        .query({key: youtubeKey})
        .query({part: 'snippet'})
        .query({type: 'video'})
        .query({q: search})
        .query({maxResults: 25})
        .end(function (err, res) {
          if (err) return
          var data = res.body
          data.searchType = searchLoc
          data.nextPage = data.nextPageToken
          socket.emit('searchResults', data)
        })
      }

      function vimeoSearch () {
        request
        .get('https://api.vimeo.com/videos')
        // .query({key: youtubeKey})
        // .query({part: 'snippet'})
        .query({query: search})
        .query({perPage: 25})
        .set('Accept', 'application/vnd.vimeo.*+json;version=3.2')
        .set('Authorization', 'bearer ' + vimeoKey)
        .end(function (err, res) {
          if (err) return
          var data = res.body
          data.searchType = searchLoc
          data.items = data.data
          delete data.data
          data.nextPage = data.page++
          socket.emit('searchResults', data)
        })
      }
    })

    socket.on('continueSearch', function (data) {
      var search = data.search
      var searchLoc = data.searchLoc
      var nextPage = data.nextPage

      switch (searchLoc) {
        case 'youtube':
          youtubeSearch()
          break
        case 'vimeo':
          vimeoSearch()
          break
      }

      function youtubeSearch () {
        request
        .get('https://www.googleapis.com/youtube/v3/search')
        .query({key: youtubeKey})
        .query({part: 'snippet'})
        .query({q: search})
        .query({type: 'video'})
        .query({pageToken: nextPage})
        .query({maxResults: 25})
        .end(function (err, res) {
          if (err) return
          var data = res.body
          data.searchType = searchLoc
          data.nextPage = data.nextPageToken
          socket.emit('moreSearchResults', data)
        })
      }

      function vimeoSearch () {
        request
        .get('https://api.vimeo.com/videos')
        // .query({key: youtubeKey})
        // .query({part: 'snippet'})
        .query({query: search})
        .query({perPage: 25})
        .query({page: nextPage})
        .set('Accept', 'application/vnd.vimeo.*+json;version=3.2')
        .set('Authorization', 'bearer ' + vimeoKey)
        .end(function (err, res) {
          if (err) return
          var data = res.body
          data.searchType = searchLoc
          data.items = data.data
          delete data.data
          data.nextPage = data.page++
          socket.emit('searchResults', data)
        })
      }
    })

    socket.on('moveMedia', function (data) {
      if (rooms[roomId].playback !== 'anyone') {
        if (rooms[roomId].controllers.indexOf(user.id) > -1) {
          moveMedia()
        }
      } else {
        moveMedia()
      }

      function moveMedia () {
        var element = rooms[roomId].queue[data.oldIndex]
        rooms[roomId].queue.splice(data.oldIndex, 1)
        rooms[roomId].queue.splice(data.newIndex, 0, element)
        sync.to(roomId).emit('moveMedia', data)
        queueChanged()
      }
    })

    socket.on('deleteMedia', function (index) {
      if (rooms[roomId].playback !== 'anyone') {
        if (rooms[roomId].controllers.indexOf(user.id) > -1) {
          deleteMedia()
        }
      } else {
        deleteMedia()
      }

      function deleteMedia () {
        rooms[roomId].queue.splice(index, 1)
        sync.to(roomId).emit('deleteMedia', index)
        queueChanged()
      }
    })

    socket.on('addMedia', function (media) {
      console.log('addMedia', media)
      if (rooms[roomId].playback !== 'anyone') {
        if (rooms[roomId].controllers.indexOf(user.id) > -1) {
          addMedia()
        }
      } else {
        addMedia()
      }

      function addMedia () {
        console.log('queue before', rooms[roomId].queue)
        if (!rooms[roomId].queue.some(function (elem) {
          return (elem.id === media.id && elem.type === media.type)
        })) {
          rooms[roomId].queue.push(media)
          sync.to(roomId).emit('addMedia', media)
          queueChanged()
        }
        console.log('queue after', rooms[roomId].queue)
      }
    })

    socket.on('pushToFront', function (index) {
      if (rooms[roomId].playback !== 'anyone') {
        if (rooms[roomId].controllers.indexOf(user.id) > -1) {
          moveToFront()
        }
      } else {
        moveToFront()
      }

      function moveToFront () {
        var elem = rooms[roomId].queue[index]
        rooms[roomId].queue.splice(index, 1)
        rooms[roomId].queue.unshift(elem)
        sync.to(roomId).emit('pushToFront', index)
        queueChanged()
      }
    })

    socket.on('chatMessage', function (message) {
      sync.to(roomId).emit('chatMessage', message)
    })

    socket.on('getState', () => sync.to(roomId).emit('getState'))

    socket.on('duration', (duration) => sync.to(roomId).emit('duration', duration))

    socket.on('currentState', function (data) {
      console.log('user sent currentState', user, data)
      sync.to(roomId).emit('currentState', data)
    })

    function queueChanged () {
      db.merge(roomId, { queue: rooms[roomId].queue }, function (err, res) {
        console.log('updated', err, res)
        console.log('updated queue')
        setTimeout(() => sync.to(roomId).emit('currentQueue', rooms[roomId].queue), 1500)
        // console.log('updated queue:', rooms[roomId], err, res)
      })
    }
  })
}
