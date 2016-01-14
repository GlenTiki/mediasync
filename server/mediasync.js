const ClientRoutes = require('./routes/clientRoutes.js')
const Package = require('../package.json')

module.exports = function (server, options, next) {
  server.route(ClientRoutes)

  next()
}

module.exports.attributes = {
  pkg: Package
}
