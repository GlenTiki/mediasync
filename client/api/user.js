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
        return done(null, user)
      }
    })
  }
}
