const ClientRoutes = require('./routes/clientRoutes.js')
const ApiRoutes = require('./routes/apiRoutes.js')
const Package = require('../package.json')
var dbConf = require('../config/couchdb.js')
var cradle = require('cradle')
var dbUtils = require('./db/dbUtils')

cradle.setup({
  host: dbConf.host,
  port: dbConf.port,
  cache: true,
  raw: false,
  secure: dbConf.secure,
  auth: dbConf.auth,
  retries: 3,
  retryTimeout: 30 * 1000
})
var dbConnection = new cradle.Connection()
var db = dbConnection.database('mediasync')

module.exports = function (server, options, next) {
  setupDb(function (db) {
    server.route(ClientRoutes())
    server.route(ApiRoutes(db))

    next()
  })
}

function setupDb (done) {
  db.exists(function (err, exists) {
    if (err) {
      console.log('error creating mediasync db', err.message, err)
      console.log('exiting!')
      process.exit(1)
    } else if (exists) {
      console.log('mediasync db exists, updating views,')
      dbUtils.createViews(db, function () {
        done(db)
      })
    } else {
      console.log('mediasync database does not exist yet. creating.')

      db.create()

      setTimeout(function () {
        dbUtils.createViews(db, function () {
          done(db)
        }, 1000)
      })
    }
  })
}

module.exports.attributes = {
  pkg: Package
}
