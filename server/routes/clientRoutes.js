const Path = require('path')
const BuildPath = Path.resolve(__dirname, '../../build')

module.exports = function () {
  return [
    {
      method: 'GET',
      path: '/assets/{path*}',
      config: { auth: false },
      handler: { directory: { path: Path.resolve(BuildPath, 'assets') } }
    },
    {
      method: 'GET',
      path: '/favicon.ico',
      config: { auth: false },
      handler: { file: Path.resolve(BuildPath, 'assets/images/favicon.ico') }
    },
    {
      method: 'GET',
      path: '/{path*}',
      config: { auth: false },
      handler: { file: Path.resolve(BuildPath, 'index.html') }
    }
  ]
}
