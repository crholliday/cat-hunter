const { DataSource } = require('apollo-datasource')

class LogAPI extends DataSource {
  constructor({ store }) {
    super()
    this.store = store
  }

  initialize(config) {
    this.context = config.context
  }

  getAll(args) {
    const userId = this.context.user._id
    if (!userId) return

    return new Promise((resolve, reject) => {
      this.store.logs
        .find(args && args.input)
        .sort({ logDate: -1 })
        .exec((err, docs) => (err ? reject(err) : resolve(docs)))
    })
  }

  getLatest() {
    const userId = this.context.user._id
    if (!userId) return

    return new Promise((resolve, reject) => {
      this.store.logs
        .findOne({})
        .sort({ logDate: -1 })
        .exec((err, docs) => (err ? reject(err) : resolve(docs)))
    })
  }

  insert(contents) {
    const userId = this.context.user._id
    if (!userId) return

    this.store.logs.insert(contents, err => {
      if (err) {
        console.log('Log insert failed: ', err)
      } else {
        console.log(`New log written to the database`)
      }
    })
  }
}

module.exports = LogAPI
