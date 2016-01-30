var sendgridKey = require('../../config/sendgridKey.js')
var sendgrid = require('sendgrid')(sendgridKey)
var fs = require('fs')
var hogan = require('hogan.js')
var inlineCss = require('inline-css')
var verifyTemplate = ''
inlineCss(fs.readFileSync(__dirname + '/validationTemplate.hjs', 'utf8'), { url: 'filePath' })
  .then(function (html) { verifyTemplate = hogan.compile(html) })

module.exports.sendEmailValidation = function (user, token, done) {
  console.log('attempting')
  sendgrid.send({
    to: user.email,
    from: 'noreply@mediasync.io',
    subject: 'Mediasync - Email Verification',
    fromname: 'MediaSync',
    html: verifyTemplate.render({ user: user, token: token })
  }, done)
}
