var request = require('superagent')
var emailValidator = require('email-validator')

module.exports.validateDisplayName = function (displayName, done) {
  if (displayName !== '') {
    if (displayName.length <= 64) { // check if entered username matches style
      return done(null, { valid: true })
    } else {
      return done(new Error('displayNameLengthError'))
    }
  } else {
    return done(new Error('displayNameEmptyError'))
  }
}

module.exports.validateUsername = function (username, done) {
  var re = /^\w+$/
  if (username !== '') { // check if entered username
    if (re.test(username)) { // check if entered username matches style
      if (typeof window === 'undefined') { // on server
        // TODO: Check DB
        return done(null, { valid: true })
      } else { // we're on the client, so let's check if username is taken
        return checkIfUsernameTaken(username, done)
      }
    } else {
      return done(new Error('unInvalidError'))
    }
  } else {
    return done(new Error('unEmptyError'))
  }
}

function checkIfUsernameTaken (username, done) {
  request
  .get(`/api/user/username/${username}`)
  .send({username: username})
  // .set('X-API-Key', 'foobar')
  .set('Accept', 'application/json')
  .end(function (err, res) {
    if (err && res.status === 404) {
      return done(null, {valid: true})
    } else if (res.body.username === username) {
      return done(new Error('unTakenError'))
    } else {
      return done(new Error('problemConnectingToServerError'))
    }
  })
}

module.exports.validateEmail = function (email, done) {
  if (emailValidator.validate(email)) {
    if (typeof window === 'undefined') { // on server
      // TODO: check db
      return done(null, { valid: true })
    } else { // we're on the client, so let's check if email is taken
      return checkIfEmailTaken(email, done)
    }
  } else {
    done(new Error('emailInvalidError'))
  }
}

function checkIfEmailTaken (email, done) {
  request
  .get(`/api/user/email/${email}`)
  .send({username: email})
  // .set('X-API-Key', 'foobar')
  .set('Accept', 'application/json')
  .end(function (err, res) {
    if (err && res.status === 404) {
      return done(null, {valid: true})
    } else if (res.body.email === email) {
      return done(new Error('emailTakenError'))
    } else {
      return done(new Error('problemConnectingToServerError'))
    }
  })
}

module.exports.validatePassword = function (password, repeat, done) {
  // console.log(password, repeat)
  // username is valid
  if (password === repeat) {
    var re = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
    if (re.test(password)) {
      return done(null, { valid: true })
    } else {
      return done(new Error('pwCharsError'))
    }
  } else {
    return done(new Error('pwMatchError'))
  }
}

// TODO: Room validation
module.exports.validateRoomName = function (name, done) {
  if (name.length > 0) {
    if (name.length < 256) {
      return done(null, {valid: true})
    } else {
      return done(new Error('nameLengthError'), {valid: false})
    }
  } else {
    return done(new Error('nameEmptyError'), {valid: false})
  }
}

module.exports.validateRoomType = function (type, done) {
  var validTypes = ['public', 'private', 'unlisted', 'membersOnly']

  var valid = (validTypes.indexOf(type) > -1)

  return done(null, {valid: valid})
}

module.exports.validateRoomPlayback = function (type, done) {
  return done(null, {valid: true})
}

module.exports.validateRoomControllers = function (controllers, done) {
  return done(null, {valid: true})
}

module.exports.validateInvitedUsers = function (users, done) {
  return done(null, {valid: true})
}
