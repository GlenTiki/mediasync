const Hapi = require('hapi')
const Inert = require('inert')
const Good = require('good')
const Nes = require('nes')
const Bell = require('bell')
const Jwt = require('hapi-auth-jwt2')
const Mediasync = require('./mediasync.js')

const Https = process.env.VCAP_SERVICES
                  ? require('hapi-require-https')
                  : function (server, options, next) { next() }
Https.attributes = Https.attributes || { pkg: { name: 'https' } }

const jwtKey = require('../config/jwtKey.js')

const Plugins = [
  Inert,
  Jwt,
  Https,
  Bell,
  Nes,
  {
    register: Good,
    options: {
      reporters: [{
        reporter: require('good-console'),
        events: {
          response: '*',
          log: '*'
        }
      }]
    }
  }
]

// bring your own validation function
var validate = function (decoded, request, callback) {
  // do your checks to see if the person is valid
  // console.log(request)
  if (!decoded.username || !decoded.agent ||
        !decoded.email || decoded.agent !== request.headers['user-agent']) {
    return callback(null, false)
  } else {
    return callback(null, true)
  }
}

var server

exports.create = function (done) {
  console.log('prod:', !!process.env.VCAP_SERVICES)
  server = new Hapi.Server()
  server.connection({
    port: process.env.PORT || 8080
  })

  server.register(Plugins, (err) => {
    if (err) {
      throw err
    }

    server.auth.strategy('twitter', 'bell', {
      provider: 'twitter',
      password: jwtKey,
      clientId: process.env.twitterClientId || 'Here goes the ClientId',
      clientSecret: process.env.twitterSecretId || 'Here goes the ClientSecret',
      isSecure: !!process.env.VCAP_SERVICES
    })

    server.auth.strategy('facebook', 'bell', {
      provider: 'facebook',
      password: jwtKey,
      clientId: process.env.facebookClientId || 'Here goes the ClientId',
      clientSecret: process.env.facebookSecretId || 'Here goes the ClientSecret',
      isSecure: !!process.env.VCAP_SERVICES
    })

    server.auth.strategy('jwt', 'jwt', {
      key: jwtKey,
      validateFunc: validate,
      verifyOptions: { algorithms: [ 'HS256' ] }
    })

    server.auth.default('jwt')

    Mediasync(server, null, function () {
      server.start((err) => {
        if (err) {
          throw err
        }

        console.log('Server running at:', server.info.uri)
        done()
      })
    })
  })
}

exports.stop = function (done) {
  server.stop({
    timeout: 0
  }, done)
}
