const { modelsDb } = require('../db')

const Model = {}

Model.getAll = () => {
  return new Promise(function(resolve, reject) {
    modelsDb.find({}).exec((err, docs) => (err ? reject(err) : resolve(docs)))
  })
}

Model.insert = contents => {
  modelsDb.insert(contents, function(err) {
    if (err) {
      console.log('Model insert failed: ', err)
    } else {
      console.log(`New Model written to the database`)
    }
  })
}

module.exports = { Model }
