// const _ = require('lodash')
// const uuid = require('node-uuid')
// const jwt = require('jsonwebtoken')
// const jwtKey = require('../../config/jwtKey.js')
// var validator = require('../../isomorphic/validator')

module.exports = function (db) {
  return [
    {
      method: 'POST',
      path: '/api/room',
      config: { auth: 'jwt' },
      handler: function (request, reply) {
        // console.log(request.payload.user)
        var room = request.payload.room
        var creator = request.auth.credentials
        console.log(room, creator)

        // check creator has validated email
        // check room doesn't exist
        // store room details
        // init room on websockets
      }
    },
    {
      method: 'GET',
      path: '/api/room/{roomName}',
      config: { auth: false },
      handler: function (request, reply) {
        const email = request.params.email ? request.params.email : ''
        db.view('user/byEmail', { key: email }, function (err, doc) {
          if (err) return reply(new Error('something went wrong...'))
          if (doc[0]) reply()
          else reply('user doesn\'t exist').code(404)
        })
      }
    }
  ]
}
