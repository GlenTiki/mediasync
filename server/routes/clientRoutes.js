const Path = require('path')
const BuildPath = Path.resolve(__dirname, '../../build')

module.exports = [
  {
    method: 'GET',
    path: '/api/{path*}',
    handler: function (request, reply) {
      reply({hello: 'world'})
    }
  },
  {
    method: 'GET',
    path: '/assets/{path*}',
    handler: { directory: { path: Path.resolve(BuildPath, 'assets') } }
  },
  {
    method: 'GET',
    path: '/{path*}',
    handler: { file: Path.resolve(BuildPath, 'index.html') }
  }
]
