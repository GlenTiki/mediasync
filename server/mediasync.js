const ClientRoutes = require('./routes/clientRoutes.js')
const ApiRoutes = require('./routes/apiRoutes.js')
const Package = require('../package.json')
var dbConf = require('../config/couchdb.js')
var cradle = require('cradle')

cradle.setup({
  host: dbConf.host,
  port: dbConf.port,
  cache: true,
  raw: false,
  secure: true,
  auth: dbConf.auth,
  retries: 3,
  retryTimeout: 30 * 1000
})

var db = new cradle.Connection()

module.exports = function (server, options, next) {
  server.route(ClientRoutes())
  server.route(ApiRoutes(db))

  next()
}

module.exports.attributes = {
  pkg: Package
}
