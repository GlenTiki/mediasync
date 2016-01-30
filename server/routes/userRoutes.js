// const _ = require('lodash')
const bcrypt = require('bcrypt')
const uuid = require('node-uuid')
const legit = require('legit')
const jwt = require('jsonwebtoken')
const emails = require('../emails')
const signUpKey = require('../../config/signUpKey.js')

function sanitizeUser (user) {
  return {
    username: user.username,
    email: user.email
  }
}

module.exports = function (db) {
  function userExists (user, cb) {
    user.username = user.username || ''
    user.email = user.email || ''
    db.view('user/byUsername', { key: user.username }, function (err, doc) {
      if (err) return cb(new Error('something went wrong...'))
      if (doc[0]) cb(null, true)
      else {
        db.view('user/byEmail', { key: user.email }, function (err, doc) {
          if (err) return cb(new Error('something went wrong...'))
          if (doc[0]) cb(null, true)
          else {
            cb(null, false)
          }
        })
      }
    })
  }

  return [
    {
      method: 'POST',
      path: '/api/users',
      config: { auth: false },
      handler: function (request, reply) {
        // console.log(request.payload.user)
        var user = request.payload.user
        user.resource = 'User'
        user.emailValidated = false
        legit(user.email, function (valid, addresses, err) {
          if (err) return reply(new Error('problem validating email')).code(425)
          if (valid) {
            userExists(user, function (err, exists) {
              if (err) return reply(err)
              if (exists) {
                return reply(new Error('Username or email is taken'))
              } else {
                bcrypt.genSalt(10, function (err, salt) {
                  if (err) return reply(new Error('error generating password salt'))
                  bcrypt.hash(user.password, salt, function (err, hash) {
                    if (err) return reply(new Error('error hashing password'))
                    user.password = hash
                    user.id = uuid.v4()
                    db.save(user.id, user, function () {
                      jwt.sign(user, signUpKey, { algorithm: 'HS256' }, function (token) {
                        console.log(`saved user ${user.username}`)
                        emails.sendEmailValidation(user, token, function (err) {
                          console.log(err)
                          if (err) return reply(new Error('problem sending verification'))
                          reply(sanitizeUser(user))
                        })
                      })
                    })
                  })
                })
              }
            })
          } else {
            return reply(new Error('invalid email address')).code(426)
          }
        })
      }
    },
    {
      method: 'GET',
      path: '/api/users/email/{email}',
      config: { auth: false },
      handler: function (request, reply) {
        const email = request.params.email ? request.params.email : ''
        db.view('user/byEmail', { key: email }, function (err, doc) {
          if (err) return reply(new Error('something went wrong...'))
          if (doc[0]) reply(sanitizeUser(doc[0].value))
          else reply('user doesn\'t exist').code(404)
        })
      }
    },
    {
      method: 'GET',
      path: '/api/users/username/{username}',
      config: { auth: false },
      handler: function (request, reply) {
        const username = request.params.username ? request.params.username : ''
        db.view('user/byUsername', { key: username }, function (err, doc) {
          if (err) return reply(new Error('something went wrong...'))
          if (doc[0]) reply(sanitizeUser(doc[0].value))
          else reply('user doesn\'t exist').code(404)
        })
      }
    }
  ]
}
