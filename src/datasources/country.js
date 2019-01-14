const { DataSource } = require('apollo-datasource')

class CountryAPI extends DataSource {
  constructor({ store }) {
    super()
    this.store = store
  }

  initialize(config) {
    this.context = config.context
  }

  find(args) {
    const userId = this.context.user._id
    if (!userId) return

    return new Promise((resolve, reject) => {
      this.store.countries.findOne(args, (err, docs) =>
        err ? reject(err) : resolve(docs)
      )
    })
  }
}

module.exports = CountryAPI
