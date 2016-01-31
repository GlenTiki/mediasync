module.exports.createViews = function (db, done) {
  db.save('_design/user', {
    views: {
      byUsername: {
        map: 'function (doc) { if (doc.resource === "User") { emit(doc.username, doc) } }'
      },
      byEmail: {
        map: 'function (doc) { if (doc.resource === "User") { emit(doc.email, doc) } }'
      },
      byFbId: {
        map: 'function (doc) { if (doc.resource === "User") { emit(doc.fbId, doc) } }'
      },
      byTwitterId: {
        map: 'function (doc) { if (doc.resource === "User") { emit(doc.twitterId, doc) } }'
      }
    }
  }, done)
}
