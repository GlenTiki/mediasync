var request = require('superagent')

module.exports = {
  create: function (room, creator, done) {
    request
    .post(`/api/room`)
    .send({room: room})
    .set('Authorization', creator.token)
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
  // update: function (room, editor, done) {
  //   request
  //   .put(`/api/room`)
  //   .set('Authorization', editor.token)
  //   .send({room: room})
  //   .set('Accept', 'application/json')
  //   // .set('X-API-Key', 'foobar')
  //   .end(function (err, res) {
  //     console.log(err)
  //     console.log(res)
  //     if (err) {
  //       return done(new Error('problemConnectingToServerError'))
  //     } else {
  //       return done(null, res.body)
  //     }
  //   })
  // },
  get: function (roomUrl, token, done) {
    request
    .get(`/api/room/${roomUrl}`)
    .set('Authorization', token)
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
  getRooms: function (done) {
    request
    .get(`/api/room`)
    .set('Accept', 'application/json')
    .end(function (err, res) {
      // console.log(err, res)
      if (err) {
        return done(new Error('user doesn\'t exist'))
      } else {
        return done(null, res.body)
      }
    })
  }
}
