const { countriesDb } = require('../db')

const Country = {}

Country.find = args => {
  return new Promise(function(resolve, reject) {
    countriesDb.findOne(args, (err, docs) =>
      err ? reject(err) : resolve(docs)
    )
  })
}

module.exports = { Country }
