var server = require('./server/server.js')

server.create(() => console.log('now running'))

console.log(process.env)
