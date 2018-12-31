const { listingsDb } = require('../db')

const Listing = {}

Listing.getAll = args => {
  return new Promise(function(resolve, reject) {
    listingsDb
      .find(args && args.input)
      .sort({ createdDate: -1 })
      .exec((err, docs) => (err ? reject(err) : resolve(docs)))
  })
}

Listing.getFavorites = () => {
  return new Promise(function(resolve, reject) {
    listingsDb
      .find({
        $and: [
          { make: { $in: ['Lagoon', 'Leopard'] } },
          {
            description: /Owner version|Owners version|Owner's version|owners version|owner version|owner's version/
          }
        ]
      })
      .sort({ createdDate: -1 })
      .exec((err, docs) => (err ? reject(err) : resolve(docs)))
  })
}

Listing.getAllIds = () => {
  return new Promise(function(resolve, reject) {
    listingsDb.find({}, { make: 1 }, (err, docs) =>
      err ? reject(err) : resolve(docs)
    )
  })
}

Listing.insert = contents => {
  listingsDb.insert(contents, function(err) {
    if (err) {
      console.log('Insert failed: ', err)
    } else {
      console.log(`${contents.length} new records written to the database`)
    }
  })
}

module.exports = { Listing }
