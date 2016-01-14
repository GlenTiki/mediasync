const Path = require('path')
const BuildPath = Path.resolve(__dirname, '../../build')

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: { file: Path.resolve(BuildPath, 'index.html') }
  },
  {
    method: 'GET',
    path: '/assets/{path*2}',
    handler: { directory: { path: Path.resolve(BuildPath, 'assets') } }
  },
  {
    method: 'GET',
    path: '/assets/fonts/{path*2}',
    handler: { directory: { path: Path.resolve(BuildPath, 'assets/fonts') } }
  }
]
