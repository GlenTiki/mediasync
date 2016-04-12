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
  }, function () {
    db.save('_design/room', {
      views: {
        byName: {
          map: 'function (doc) { if (doc.resource === "Room") { emit(doc.name, doc) } }'
        },
        byCreatorId: {
          map: 'function (doc) { if (doc.resource === "Room") { emit(doc.creator, doc) } }'
        }
      }
    }, done)
  })
}
