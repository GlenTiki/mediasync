// const _ = require('lodash')
const bcrypt = require('bcrypt')
const Jwt = require('jsonwebtoken')

const jwtKey = require('../../config/jwtKey.js')
const signupKey = require('../../config/signUpKey.js')

function sanitizeUser (user) {
  return {
    username: user.username,
    email: user.email,
    emailValidated: user.emailValidated
  }
}

module.exports = function (db) {
  return [
    {
      method: 'POST',
      path: '/api/auth/signin',
      config: { auth: false },
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
                emailValidated: doc[0].value.emailValidated,
                agent: request.headers['user-agent'],
                expiresIn: '1000d'
              }
              Jwt.sign(obj, jwtKey, { algorithm: 'HS256' }, function (token) {
                reply(sanitizeUser(doc[0].value)).header('Authorization', token).code(201)
              })
            })
          } else {
            reply('user doesn\'t exist').code(404)
          }
        })
      }
    },
    {
      method: 'GET',
      path: '/api/auth/validate/{token?}',
      config: { auth: false },
      handler: function (request, reply) {
        Jwt.verify(request.params.token, signupKey, function (err, decoded) {
          if (err) return reply(new Error('Problem with verification'))
          db.view('user/byUsername', { key: decoded.username }, function (err, doc) {
            if (err) {
              return reply('problem getting user from database').code(404)
            }
            if (doc[0]) {
              db.merge(doc[0].value._id, { emailValidated: true }, function (err, res) {
                if (err) return reply('problem updating user in database').code(404)
                else {
                  reply()
                    .redirect('/validationSuccess')
                    .code(301)
                }
              })
            } else {
              reply('user doesn\'t exist').code(404)
            }
          })
        })
      }
    },
    {
      method: 'GET',
      path: '/api/auth/facebookSignin',
      config: {
        auth: {
          strategy: 'facebook',
          mode: 'try'
        }
      },
      handler: function (request, reply) {
        if (request.auth.isAuthenticated) {
          db.view('user/byFbId', { key: request.auth.credentials.profile.id }, function (err, doc) {
            if (err) {
              return reply('problem getting user from database').code(404)
            }
            if (doc[0]) {
              var obj = {
                username: doc[0].value.username,
                email: doc[0].value.email,
                emailValidated: doc[0].value.emailValidated,
                agent: request.headers['user-agent'],
                expiresIn: '1000d'
              }

              Jwt.sign(obj, jwtKey, { algorithm: 'HS256' }, function (token) {
                reply()
                  .redirect('/?token=' + token)
                  .code(301)
              })
            } else {
              return reply()
                .redirect('/fbErrorSignin')
                .code(301)
            }
          })
        } else {
          return reply()
            .redirect('/fbErrorSignin')
            .code(301)
        }
      }
    },
    {
      method: 'GET',
      path: '/api/auth/facebookSignup',
      config: {
        auth: {
          strategy: 'facebook',
          mode: 'try'
        }
      },
      handler: function (request, reply) {
        // console.log(request.auth)
        // console.log(request.server.info.protocol)
        // request.auth.jwt.set(request.auth.credentials)
        // request.response.header('Authorization', 'TESTING')
        db.view('user/byFbId', { key: request.auth.credentials.profile.id }, function (err, doc) {
          if (err) {
            return reply('problem getting user from database').code(404)
          }
          if (doc[0]) {
            return reply()
              .redirect('/fbErrorSignup')
              .code(301)
          } else {
            reply()
              .redirect(`/signup?name=${encodeURIComponent(request.auth.credentials.profile.displayName)}&email=${encodeURIComponent(request.auth.credentials.profile.email)}&fb=${encodeURIComponent(request.auth.credentials.profile.id)}`)
              .code(301)
          }
        })
      }
    },
    {
      method: 'GET',
      path: '/api/auth/twitterSignin',
      config: {
        auth: {
          strategy: 'twitter',
          mode: 'try'
        }
      },
      handler: function (request, reply) {
        if (request.auth.isAuthenticated) {
          db.view('user/byTwitterId', { key: request.auth.credentials.profile.id }, function (err, doc) {
            if (err) {
              return reply('problem getting user from database').code(404)
            }
            if (doc[0]) {
              var obj = {
                username: doc[0].value.username,
                email: doc[0].value.email,
                emailValidated: doc[0].value.emailValidated,
                agent: request.headers['user-agent'],
                expiresIn: '1000d'
              }

              Jwt.sign(obj, jwtKey, { algorithm: 'HS256' }, function (token) {
                reply()
                  .redirect('/?token=' + token)
                  .code(301)
              })
            } else {
              return reply()
                .redirect('/twitterErrorSignin')
                .code(301)
            }
          })
        } else {
          return reply()
            .redirect('/twitterErrorSignin')
            .code(301)
        }
      }
    },
    {
      method: 'GET',
      path: '/api/auth/twitterSignup',
      config: {
        auth: {
          strategy: 'twitter',
          mode: 'try'
        }
      },
      handler: function (request, reply) {
        // console.log(request.auth)
        // console.log(request.server.info.protocol)
        // request.auth.jwt.set(request.auth.credentials)
        // request.response.header('Authorization', 'TESTING')
        db.view('user/byTwitterId', { key: request.auth.credentials.profile.id }, function (err, doc) {
          if (err) {
            return reply('problem getting user from database').code(404)
          }
          if (doc[0]) {
            return reply()
              .redirect('/twitterErrorSignup')
              .code(301)
          } else {
            reply()
              .redirect(`/signup?name=${encodeURIComponent(request.auth.credentials.profile.displayName)}&username=${encodeURIComponent(request.auth.credentials.profile.username)}&twitter=${encodeURIComponent(request.auth.credentials.profile.id)}`)
              .code(301)
          }
        })
      }
    },
    {
      method: 'GET',
      path: '/api/auth/me',
      config: {
        auth: 'jwt'
      },
      handler: function (request, reply) {
        console.log(request.auth)
        // request.auth.jwt.set(request.auth.credentials)
        reply(sanitizeUser(request.auth.credentials))
      }
    }
  ]
}
