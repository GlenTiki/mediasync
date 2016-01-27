var dbconf = {
  secure: false
}

if (process.env.VCAP_SERVICES) {
  var VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES)
  dbconf = {
    host: VCAP_SERVICES.cloudantNoSQLDB[0].credentials.host,
    port: VCAP_SERVICES.cloudantNoSQLDB[0].credentials.port,
    username: VCAP_SERVICES.cloudantNoSQLDB[0].credentials.username,
    password: VCAP_SERVICES.cloudantNoSQLDB[0].credentials.password,
    secure: true
  }
}

module.exports = {
  host: dbconf.host || 'localhost',
  port: dbconf.port || 5984,
  auth: {
    username: dbconf.username || 'fyp',
    password: dbconf.password || 'default'
  },
  secure: dbconf.secure
}
