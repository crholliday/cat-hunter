const { DataSource } = require('apollo-datasource')

class ModelAPI extends DataSource {
  constructor({ store }) {
    super()
    this.store = store
  }

  initialize(config) {
    this.context = config.context
  }

  getAll() {
    const userId = this.context.user._id
    if (!userId) return

    return new Promise((resolve, reject) => {
      this.store.models
        .find({})
        .exec((err, docs) => (err ? reject(err) : resolve(docs)))
    })
  }

  insert(contents) {
    const userId = this.context.user._id
    if (!userId) return

    this.store.models.insert(contents, err => {
      if (err) {
        console.log('Model insert failed: ', err)
      } else {
        console.log(`New Model written to the database`)
      }
    })
  }
}

module.exports = ModelAPI
