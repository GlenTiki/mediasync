var redisConf = {
  host: '127.0.0.1',
  port: '6379',
  password: 'foobared'
}

if (process.env.VCAP_SERVICES) {
  var VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES)
  redisConf = {
    host: VCAP_SERVICES['redis-2.6'][0].credentials.host,
    port: VCAP_SERVICES['redis-2.6'][0].credentials.port,
    password: VCAP_SERVICES['redis-2.6'][0].credentials.password
  }
}

module.exports = redisConf
