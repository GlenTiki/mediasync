// const _ = require('lodash')
const bcrypt = require('bcrypt')

function sanitizeUser (user) {
  return {
    username: user.username,
    email: user.email
  }
}

module.exports = function (db) {
  return [
    {
      method: 'POST',
      path: '/api/users',
      handler: function (request, reply) {
        console.log(request.payload.user)
        var user = request.payload.user
        user.resource = 'User'
        bcrypt.genSalt(10, function (err, salt) {
          if (err) return reply(new Error('error generating password salt'))

          bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return reply(new Error('error hashing password'))
            user.password = hash
            db.save(user, function () {
              console.log(`saved user ${user.username}`)
              reply(user)
            })
          })
        })
        // const user = _.find(users, {email: email})
        // console.log(user)
        // if (user) {
        //   return reply(sanitizeUser(user))
        // } else {
        //   return reply('user doesn\'t exist').code(404)
        // }
      }
    },
    {
      method: 'GET',
      path: '/api/users/email/{email}',
      handler: function (request, reply) {
        const email = request.params.email ? request.params.email : ''
        db.view('user/byEmail', { key: email }, function (err, doc) {
          if (err) reply(new Error('something went wrong...'))
          if (doc[0]) reply(sanitizeUser(doc[0].value))
          else reply('user doesn\'t exist').code(404)
        })
      }
    },
    {
      method: 'GET',
      path: '/api/users/username/{username}',
      handler: function (request, reply) {
        const username = request.params.username ? request.params.username : ''
        db.view('user/byUsername', { key: username }, function (err, doc) {
          console.log(err, doc)
          if (err) reply(new Error('something went wrong...'))
          if (doc[0]) reply(sanitizeUser(doc[0].value))
          else reply('user doesn\'t exist').code(404)
        })
      }
    }
  ]
}
