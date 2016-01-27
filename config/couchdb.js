var dbconf = {}

if (process.env.VCAP_SERVICES) {
  var VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES)
  dbconf = {
    host: VCAP_SERVICES.cloudantNoSQLDB[0].credentials.host,
    port: VCAP_SERVICES.cloudantNoSQLDB[0].credentials.port,
    username: VCAP_SERVICES.cloudantNoSQLDB[0].credentials.username,
    password: VCAP_SERVICES.cloudantNoSQLDB[0].credentials.password
  }
}

module.exports = {
  host: 'localhost' || dbconf.host,
  port: 5984 || dbconf.port,
  auth: {
    username: 'fyp' || dbconf.user,
    password: 'default' || dbconf.password
  }
}
