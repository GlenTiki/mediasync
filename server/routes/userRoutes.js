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
var validator = require('../../isomorphic/validator')
const Path = require('path')
const BuildPath = Path.resolve(__dirname, '../../build')

const recaptcha = new ReCAPTCHA({
  siteKey: capKey.client,
  secretKey: capKey.server
})

function sanitizeUser (user) {
  return {
    name: user.name,
    id: user.id || user._id,
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

  function checkIfEmailTaken (email, cb) {
    db.view('user/byEmail', { key: email }, function (err, doc) {
      if (err) return cb(new Error('something went wrong...'))
      if (doc[0]) cb(null, true)
      else {
        cb(null, false)
      }
    })
  }

  function checkIfUsernameTaken (username, cb) {
    db.view('user/byUsername', { key: username }, function (err, doc) {
      if (err) return cb(new Error('something went wrong...'))
      if (doc[0]) cb(null, true)
      else {
        cb(null, false)
      }
    })
  }

  function resendVerification (user, cb) {
    jwt.sign(user, signUpKey, { algorithm: 'HS256' }, function (token) {
      emails.sendEmailValidation(user, token, function (err) {
        if (err) return cb(new Error('problem sending verification'))
        cb(null)
      })
    })
  }

  return [
    {
      method: 'POST',
      path: '/api/user',
      config: { auth: false },
      handler: function (request, reply) {
        // console.log(request.payload.user)
        var user = request.payload.user
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
              // TODO: call the isomorphic validator
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
      method: 'PUT',
      path: '/api/user',
      config: { auth: 'jwt' },
      handler: function (request, reply) {
        var user = request.payload.user
        db.get(request.auth.credentials.id, function (err, original) {
          if (err) {
            return reply(new Error('something went fataly wrong'))
          }
          bcrypt.compare(user.password, original.password, function (err, match) {
            if (err) return reply(new Error('something went wrong...'))
            if (!match) return reply('invalid password').code(401)

            if (user.name !== original.name) original.name = user.name

            if (user.email !== original.email) {
              original.email = user.email
              original.emailValidated = (original.validatedEmails.indexOf(user.email) > -1)
              // check if new email taken...
              legit(original.email, function (valid, addresses, err) {
                if (err) return reply('problem validating email').code(425)
                if (valid) {
                  checkIfEmailTaken(original.email, function (err, taken) {
                    if (err) return reply(err)
                    if (taken) return reply(new Error('email taken')).code(430)
                    else checkUsername()
                  })
                } else {
                  return reply(new Error('invalid email address')).code(426)
                }
              })
            } else {
              checkUsername()
            }
          })

          function checkUsername () {
            if (user.username !== original.username) {
              validator.validateUsername(user.username, function (err, res) {
                if (err || !res.valid) return reply(new Error('invalidUsername')).code(500)
                checkIfUsernameTaken(user.username, function (err, taken) {
                  if (err || taken) {
                    return reply(new Error('usernameTaken')).code(500)
                  }
                  original.username = user.username
                  updateUser()
                })
              })
            } else {
              updateUser()
            }
          }

          function updateUser () {
            db.save(request.auth.credentials.id, original, function (err) {
              if (err) return reply(new Error('problem updating db'))
              else {
                original.expiresIn = '1000d'
                jwt.sign(sanitizeUser(original), jwtKey, { algorithm: 'HS256' }, function (token) {
                  original.token = token
                  reply(sanitizeUser(original))

                  if (!original.emailValidated) {
                    resendVerification(original, function (err) {
                      // dirty hack to resend verification. user gets no feedback if err
                      if (err) {
                        console.error('problem sending verification for new email for user', original.username)
                        console.error(err)
                        return
                      }
                      this.code = function () {}
                    })
                  }
                })
              }
            })
          }
        })
      }
    },
    {
      method: 'POST',
      path: '/api/user/resendVerification',
      config: { auth: 'jwt' },
      handler: function (request, reply) {
        resendVerification(request.auth.credentials, reply)
      }
    },
    {
      method: 'GET',
      path: '/api/user/email/{email}',
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
      path: '/api/user/username/{username}',
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
      method: 'GET',
      path: '/api/user/{id}',
      config: { auth: false },
      handler: function (request, reply) {
        const id = request.params.id ? request.params.id : ''
        db.get(id, function (err, user) {
          if (err) return reply(new Error('something went wrong...'))
          if (user) reply(sanitizeUser(user))
          else reply('user doesn\'t exist').code(404)
        })
      }
    },
    {
      method: 'GET',
      path: '/api/users/pic/{username}',
      config: { auth: false },
      handler: {
        file: Path.resolve(BuildPath, 'assets/images/profilePic.png')
      }
    },
    {
      method: 'POST',
      path: '/api/user/updateFbId',
      config: { auth: 'jwt' },
      handler: function (request, reply) {
        const fbId = request.payload.fbId
        db.view('user/byUsername', { key: request.auth.credentials.username }, function (err, doc) {
          if (err) return reply(new Error('something went wrong...'))
          if (doc[0]) {
            doc[0].value.fbId = fbId
            db.save(doc[0].value._id, doc[0].value, function (err) {
              if (err) {
                reply('something went wrong').code(500)
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
      path: '/api/user/updateTwitterId',
      config: { auth: 'jwt' },
      handler: function (request, reply) {
        console.log(request.payload)
        const twitterId = request.payload.twitterId
        db.view('user/byUsername', { key: request.auth.credentials.username }, function (err, doc) {
          if (err) return reply(new Error('something went wrong...'))
          if (doc[0]) {
            doc[0].value.twitterId = twitterId
            db.save(doc[0].value._id, doc[0].value, function (err) {
              if (err) {
                reply('something went wrong').code(500)
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
