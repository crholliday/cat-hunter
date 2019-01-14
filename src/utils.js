module.exports.createStore = () => {
  const Datastore = require('nedb')

  const listings = new Datastore({
    filename: './db/listings.db',
    autoload: true
  })

  const countries = new Datastore({
    filename: './db/countries.db',
    autoload: true
  })

  const models = new Datastore({
    filename: './db/models.db',
    autoload: true
  })

  const logs = new Datastore({
    filename: './db/logs.db',
    autoload: true
  })

  const users = new Datastore({
    filename: './db/users.db',
    autoload: true
  })

  return { listings, countries, models, logs, users }
}
