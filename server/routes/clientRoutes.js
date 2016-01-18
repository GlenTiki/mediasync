const Path = require('path')
const BuildPath = Path.resolve(__dirname, '../../build')

module.exports = [
  {
    method: 'GET',
    path: '/{path*}',
    handler: { file: Path.resolve(BuildPath, 'index.html') }
  },
  {
    method: 'GET',
    path: '/assets/{path*}',
    handler: { directory: { path: Path.resolve(BuildPath, 'assets') } }
  },
  {
    method: '*',
    path: '/api/{path*}',
    handler: function (req, res) {
      res.send({hello: 'world'})
    }
  }
]
