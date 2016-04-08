var request = require('superagent')

module.exports = {
  create: function (user, done) {
    request
    .post(`/api/user`)
    .send({user: user})
    // .set('X-API-Key', 'foobar')
    .set('Accept', 'application/json')
    .end(function (err, res) {
      if (err) {
        return done(new Error('problemConnectingToServerError'))
      } else {
        return done(null, res.body)
      }
    })
  },

  update: function (user, done) {
    request
    .put(`/api/user`)
    .set('Authorization', user.token)
    .send({user: user})
    .set('Accept', 'application/json')
    // .set('X-API-Key', 'foobar')
    .end(function (err, res) {
      console.log(err)
      console.log(res)
      if (err && res.status === 401) {
        return done(new Error('currPWMatchFormError'))
      } else if (err) {
        return done(new Error('problemConnectingToServerError'))
      } else {
        return done(null, res.body)
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
      if (err && (res.status === 401 || res.status === 404)) {
        return done(new Error('signinError'))
      } else if (res.status === 201) {
        return done(null, res.body)
      }

      done(new Error('signinConnectionError'))
    })
  },

  getUserByUsername: function (username, done) {
    request
    .get(`/api/user/username/${username}`)
    .set('Accept', 'application/json')
    .end(function (err, res) {
      // console.log(err, res)
      if (err) {
        return done(new Error('user doesn\'t exist'))
      } else {
        return done(null, {
          name: res.body.name,
          username: res.body.username,
          email: res.body.email
        })
      }
    })
  },

  me: function (token, done) {
    request
    .get(`/api/auth/me`)
    .set('Authorization', token)
    .set('Accept', 'application/json')
    // .set('X-API-Key', 'foobar')
    .end(function (err, res) {
      // console.log(err, res)
      if (err) {
        return done(new Error('invalid token'))
      } else {
        return done(null, res.body)
      }
    })
  },

  saveFbId: function (data, done) {
    request
    .post(`/api/user/updateFbId`)
    .send({fbId: data.fbId})
    .set('Authorization', data.token)
    .set('Accept', 'application/json')
    // .set('X-API-Key', 'foobar')
    .end(function (err, res) {
      // console.log(err, res)
      if (err) {
        return done(new Error('invalid token'))
      } else {
        return done(null, res.body)
      }
    })
  },

  saveTwitterId: function (data, done) {
    request
    .post(`/api/user/updateTwitterId`)
    .send({twitterId: data.twitterId})
    .set('Authorization', data.token)
    .set('Accept', 'application/json')
    // .set('X-API-Key', 'foobar')
    .end(function (err, res) {
      // console.log(err, res)
      if (err) {
        return done(new Error('invalid token'))
      } else {
        return done(null, res.body)
      }
    })
  },

  resendVerification: function (data, done) {
    request
    .post(`/api/user/resendVerification`)
    .set('Authorization', data.token)
    .set('Accept', 'application/json')
    // .set('X-API-Key', 'foobar')
    .end(function (err, res) {
      // console.log(err, res)
      if (err) {
        return done(new Error('invalid token'))
      } else {
        return done(null, res.body)
      }
    })
  }
}
