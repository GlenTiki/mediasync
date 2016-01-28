// const _ = require('lodash')
const bcrypt = require('bcrypt')
const Jwt = require('jsonwebtoken')

const jwtKey = process.env.jwtKey || require('../../config/jwt-default-key.js')

function sanitizeUser (user) {
  return {
    username: user.username,
    email: user.email
  }
}

module.exports = function (db) {
  return [
    {
      method: 'POST',
      path: '/api/auth/signin',
      config: {auth: false},
      handler: function (request, reply) {
        var username = request.payload.username
        var password = request.payload.password
        db.view('user/byUsername', { key: username }, function (err, doc) {
          if (err) {
            return reply('user doesn\'t exist').code(401)
          }
          if (doc[0]) {
            bcrypt.compare(password, doc[0].value.password, function (err, res) {
              if (err) return reply(new Error('something went wrong...'))
              if (!res) return reply('invalid password').code(401) // unauthorised

              var obj = {
                username: username,
                email: doc[0].value.email,
                agent: request.headers['user-agent']
              }
              var token = Jwt.sign(obj, jwtKey)

              reply(sanitizeUser(doc[0].value)).header('Authorization', token).code(201)
            })
          } else {
            reply('user doesn\'t exist').code(404)
          }
        })
      }
    },
    {
      method: 'GET',
      path: '/api/auth/me',
      config: {auth: {mode: 'try', strategy: 'jwt'}},
      handler: function (request, reply) {
        console.log(request)
        reply().code(204)
      }
    }
  ]
}
