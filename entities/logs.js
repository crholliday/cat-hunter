const { logsDb } = require('../db')

const Log = {}

Log.getAll = args => {
  return new Promise(function(resolve, reject) {
    logsDb
      .find(args && args.input)
      .sort({ logDate: -1 })
      .exec((err, docs) => (err ? reject(err) : resolve(docs)))
  })
}

Log.getLatest = () => {
  return new Promise(function(resolve, reject) {
    logsDb
      .findOne({})
      .sort({ logDate: -1 })
      .exec((err, docs) => (err ? reject(err) : resolve(docs)))
  })
}

Log.insert = contents => {
  logsDb.insert(contents, function(err) {
    if (err) {
      console.log('Log insert failed: ', err)
    } else {
      console.log(`New log written to the database`)
    }
  })
}

module.exports = { Log }
