module.exports.createViews = function (db, done) {
  db.save('_design/user', {
    views: {
      byUsername: {
        map: 'function (doc) { if (doc.resource === "User") { emit(doc.username, doc) } }'
      },
      byEmail: {
        map: 'function (doc) { if (doc.resource === "User") { emit(doc.email, doc) } }'
      }
    }
  }, done)
}
