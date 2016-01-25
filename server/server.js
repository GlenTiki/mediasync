const Hapi = require('hapi')
const Inert = require('inert')
const Good = require('good')
const Nes = require('nes')
const MediaSync = require('./mediasync.js')

const Plugins = [
  Inert,
  Nes, {
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
  },
  MediaSync
]

var server

exports.create = function (done) {
  server = new Hapi.Server()
  server.connection({
    port: process.env.PORT || 8080
  })

  server.register(Plugins, (err) => {
    if (err) {
      throw err
    }

    server.start((err) => {
      if (err) {
        throw err
      }

      console.log('Server running at:', server.info.uri)
      done()
    })
  })
}

exports.stop = function (done) {
  server.stop({
    timeout: 0
  }, done)
}
