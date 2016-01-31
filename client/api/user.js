var request = require('superagent')

module.exports = {
  create: function (user, done) {
    request
    .post(`/api/users`)
    .send({user: user})
    // .set('X-API-Key', 'foobar')
    .set('Accept', 'application/json')
    .end(function (err, res) {
      if (err) {
        return done(new Error('problemConnectingToServerError'))
      } else {
        return done(null, res.header.authorization)
      }
    })
  },

  signin: function (authData, done) {
    request
    .post(`/api/auth/signin`)
    .set('Accept', 'application/json')
    .send(authData)
    // .set('X-API-Key', 'foobar')
    .end(function (err, res) {
      if (err && res.status === 401) {
        return done(new Error('signinError'))
      } else if (res.status === 201) {
        console.log(res)
        return done(null, {
          username: res.body.username,
          token: res.header.authorization,
          email: res.body.email,
          emailValidated: res.body.emailValidated
        })
      }

      done(new Error('signinConnectionError'))
    })
  },

  me: function (token, done) {
    request
    .get(`/api/auth/me`)
    .set('Authorization', token)
    .set('Accept', 'application/json')
    // .set('X-API-Key', 'foobar')
    .end(function (err, res) {
      if (err) {
        return done(new Error('signinError'))
      } else {
        return done(null, {
          username: res.body.username,
          token: token,
          email: res.body.email,
          emailValidated: res.body.emailValidated
        })
      }
    })
  }
}
