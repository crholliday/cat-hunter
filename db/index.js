const Datastore = require('nedb')

const listingsDb = new Datastore({
  filename: './db/listings.db',
  autoload: true
})

const countriesDb = new Datastore({
  filename: './db/countries.db',
  autoload: true
})

const modelsDb = new Datastore({
  filename: './db/models.db',
  autoload: true
})

const logsDb = new Datastore({
  filename: './db/logs.db',
  autoload: true
})

module.exports = {
  listingsDb,
  countriesDb,
  modelsDb,
  logsDb
}
