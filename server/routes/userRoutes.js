// const _ = require('lodash')
const ReCAPTCHA = require('recaptcha2')
const bcrypt = require('bcrypt')
const uuid = require('node-uuid')
const legit = require('legit')
const jwt = require('jsonwebtoken')
const emails = require('../emails')
const signUpKey = require('../../config/signUpKey.js')
const jwtKey = require('../../config/jwtKey.js')
const capKey = require('../../config/recaptcha.js')

const recaptcha = new ReCAPTCHA({
  siteKey: capKey.client,
  secretKey: capKey.server
})

function sanitizeUser (user) {
  return {
    name: user.name,
    username: user.username,
    email: user.email,
    emailValidated: user.emailValidated,
    fbId: user.fbId,
    twitterId: user.twitterId,
    token: user.token
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
        console.log(user)
        user.resource = 'User'
        user.emailValidated = false
        // console.log(request.info.remoteAddress)

        recaptcha
        .validate(request.payload.user.captcha, request.info.remoteAddress)
        .then(function () {
          user.captcha = null
          user.validatedEmails = []
          legit(user.email, function (valid, addresses, err) {
            if (err) return reply('problem validating email').code(425)
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
                      db.save(uuid.v4(), user, function () {
                        console.log(`saved user ${user.username}`)
                        jwt.sign(user, signUpKey, { algorithm: 'HS256' }, function (token) {
                          emails.sendEmailValidation(user, token, function (err) {
                            if (err) return reply(new Error('problem sending verification'))
                            jwt.sign(user, jwtKey, { algorithm: 'HS256' }, function (token) {
                              user.token = token
                              reply(sanitizeUser(user))
                            })
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
        }).catch(function (errorCodes) {
          console.log(errorCodes)
          reply('problem validating recaptcha').code(425)
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
    },
    {
      method: 'POST',
      path: '/api/users/updateFbId',
      config: { auth: 'jwt' },
      handler: function (request, reply) {
        const fbId = request.payload.fbId
        db.view('user/byUsername', { key: request.auth.credentials.username }, function (err, doc) {
          if (err) return reply(new Error('something went wrong...'))
          if (doc[0]) {
            doc[0].value.fbId = fbId
            db.save(doc[0].value._id, doc[0].value, function (err) {
              if (err) {
                reply('something went wront').code(500)
              }
              doc[0].value.token = request.auth.token
              reply(sanitizeUser(doc[0].value))
            })
          }
          else reply('user doesn\'t exist').code(404)
        })
      }
    },
    {
      method: 'POST',
      path: '/api/users/updateTwitterId',
      config: { auth: 'jwt' },
      handler: function (request, reply) {
        const twitterId = request.payload.twitterId
        db.view('user/byUsername', { key: request.auth.credentials.username }, function (err, doc) {
          if (err) return reply(new Error('something went wrong...'))
          if (doc[0]) {
            doc[0].value.twitterId = twitterId
            db.save(doc[0].value._id, doc[0].value, function (err) {
              if (err) {
                reply('something went wront').code(500)
              }
              doc[0].value.token = request.auth.token
              reply(sanitizeUser(doc[0].value))
            })
          }
          else reply('user doesn\'t exist').code(404)
        })
      }
    }
  ]
}
