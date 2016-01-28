var request = require('superagent')

module.exports = {
  create: function (user, done) {
    request
    .post(`/api/users`)
    .send({user: user})
    // .set('X-API-Key', 'foobar')
    .set('Accept', 'application/json')
    .end(function (err, body) {
      if (err) {
        return done(new Error('problemConnectingToServerError'))
      } else {
        return done(null, user)
      }
    })
  },

  signin: function (authData, done) {
    request
    .post(`/api/auth/signin`)
    .send(authData)
    // .set('X-API-Key', 'foobar')
    .set('Accept', 'application/json')
    .end(function (err, body) {
      if (err && body.status === 401) {
        return done(new Error('signinError'))
      } else if (body.status === 201) {
        console.log(body)
        return done(null, body)
      }

      done(new Error('signinConnectionError'))
    })
  }
}
