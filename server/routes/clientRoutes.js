const Path = require('path')
const _ = require('lodash')
const BuildPath = Path.resolve(__dirname, '../../build')

var users = [
  {
    id: 0,
    username: 'thekemkid',
    email: 'glenkeane.94@gmail.com'
  }
]

function sanitizeUser (user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email
  }
}

module.exports = [
  {
    method: 'GET',
    path: '/api/users/email/{email}',
    handler: function (request, reply) {
      const email = request.params.email ? request.params.email : ''
      console.log(email)
      const user = _.find(users, {email: email})
      console.log(user)
      if (user) {
        return reply(sanitizeUser(user))
      } else {
        return reply('user doesn\'t exist').code(404)
      }
    }
  },
  {
    method: 'GET',
    path: '/api/users/username/{username}',
    handler: function (request, reply) {
      const username = request.params.username ? request.params.username : ''
      const user = _.find(users, {username: username})
      if (user) {
        return reply(sanitizeUser(user))
      } else {
        return reply('user doesn\'t exist').code(404)
      }
    }
  },
  {
    method: 'GET',
    path: '/api/{path*}',
    handler: function (request, reply) {
      reply({hello: 'world'})
    }
  },
  {
    method: 'GET',
    path: '/assets/{path*}',
    handler: { directory: { path: Path.resolve(BuildPath, 'assets') } }
  },
  {
    method: 'GET',
    path: '/{path*}',
    handler: { file: Path.resolve(BuildPath, 'index.html') }
  }
]
