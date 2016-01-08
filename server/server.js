const Path = require('path')
const Hapi = require('hapi')
const Inert = require('inert')
const Good = require('good');

const ClientPath = Path.resolve(__dirname, '../client')
const BuildPath = Path.resolve(__dirname, '../build')

const Plugins = [
  Inert,
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

var server;

exports.create = function (done) {
  server = new Hapi.Server()

  server.connection({ port: 8080 })


  server.register(Plugins, (err) => {
    if (err) {
      throw err
    }

    setupRoutes()

    server.start((err) => {
      if (err) {
        throw err
      }

      console.log('Server running at:', server.info.uri)
      done()
    })
  })

  function setupRoutes () {  
    server.route({
      method: 'GET',
      path: '/{path*2}',
      handler: { directory: { path: Path.resolve(BuildPath, 'assets') } }
    })
    server.route({
      method: 'GET',
      path: '/',
      handler: { file: Path.resolve(BuildPath, 'index.html') }
    })

  }
}

exports.stop = function (done) {
  server.stop({timeout: 0}, done)
}