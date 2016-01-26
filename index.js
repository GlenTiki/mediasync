var server = require('./server/server.js')

server.create(() => console.log('now running'))

if (process.env.VCAP_SERVICES) {
  console.log(process.env.VCEP_SERVICES)
  var VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES)
  console.log(VCAP_SERVICES)
  console.log(JSON.stringify(VCAP_SERVICES, null, 2))
}
