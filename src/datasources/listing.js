const axios = require('axios')
const fuzz = require('fuzzball')
const { DataSource } = require('apollo-datasource')
const { API_KEY } = require('../config')

class ListingAPI extends DataSource {
  constructor({ store }) {
    super()
    this.store = store
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config) {
    this.context = config.context
  }

  getAll(args) {
    const userId = this.context.user._id
    if (!userId) return

    return new Promise((resolve, reject) => {
      this.store.listings
        .find(args && args.input)
        .sort({ createdDate: -1 })
        .exec((err, docs) => (err ? reject(err) : resolve(docs)))
    })
  }

  getFavorites() {
    const userId = this.context.user._id
    if (!userId) return

    return new Promise((resolve, reject) => {
      this.store.listings
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

  getAllListingIds(args) {
    const userId = this.context.user._id
    if (!userId) return

    return new Promise((resolve, reject) => {
      this.store.listings.find({}, { make: 1 }, (err, docs) =>
        err ? reject(err) : resolve(docs)
      )
    })
  }

  insert(contents) {
    this.store.listings.insert(contents, err => {
      if (err) {
        console.log('Insert failed: ', err)
      } else {
        console.log(`${contents.length} new records written to the database`)
      }
    })
  }

  async getNewListings() {
    let logEntry = {}
    let page = 1
    let last = 100
    const ids = await this.getAllListingIds()
    let newListings = []

    do {
      let { lastPage, listings } = await this.getNewListingsByPage(page, ids)
      if (listings && listings.length > 0) {
        if (newListings.length > 0) {
          newListings = newListings.concat(listings)
        } else {
          newListings = listings
        }
      }

      last = lastPage

      if (page === last) {
        if (newListings.length > 0) {
          console.log(`Found some new listings...`)
          this.insert(newListings)
          // compose log entries
          logEntry.newRecordCount =
            newListings.length > 0 ? newListings.length : 0
          logEntry.totalRecordCount = ids.length + newListings.length
          logEntry.logDate = new Date().toISOString()
          this.store.logs.insert(logEntry)
          return `${newListings.length} records added.`
        } else {
          logEntry.newRecordCount = 0
          logEntry.totalRecordCount = ids.length
          logEntry.logDate = new Date().toISOString()
          this.store.logs.insert(logEntry)
          return 'No new records found.'
        }
      } else {
        page++
      }
    } while (page <= last)
  }

  async getNewListingsByPage(page, ids) {
    let requestQuery = {
      method: 'get',
      url: 'https://api-gateway.boats.com/api-yachtworld/search',
      params: {
        apikey: API_KEY,
        uom: 'ft',
        currency: 'USD',
        condition: 'used',
        year: '2000-',
        length: '40-50',
        price: '200000-400000',
        created: '-120',
        boatType: 'sail',
        class: 'sail-catamaran',
        page: page,
        pageSize: 50
      }
    }
    const response = await axios(requestQuery)
    const lastPage = response.data.search.lastPage

    // check if each item is already in our json
    const newRecords = response.data.search.records.filter(record => {
      return ids.findIndex(i => i._id === record.id) === -1
    })

    // format new records to fit our data structure
    let newFormattedBoats = await this.makeListingRecords(newRecords)

    return {
      lastPage: lastPage,
      listings: newFormattedBoats
    }
  }

  async makeListingRecords(records) {
    return Promise.all(
      records.map(async record => {
        let countryName = await this.getCountryName(record.location.countryCode)
        return {
          _id: record.id,
          make: record.boat.make,
          model: record.boat.model,
          matchedFuzzballModel: await this.getModelFuzzyMatch(
            record.boat.make + ' ' + record.boat.model
          ),
          year: record.boat.year,
          name: record.boat.normalizedName,
          price: record.price.type && record.price.type.amount['USD'],
          ownersVersion: this.isOwnersVersion(record),
          length:
            record.boat.specifications.dimensions.lengths &&
            record.boat.specifications.dimensions.lengths.overall &&
            record.boat.specifications.dimensions.lengths.overall.ft,
          beam:
            record.boat.specifications.dimensions.beam &&
            record.boat.specifications.dimensions.beam.ft,
          draft:
            record.boat.specifications.dimensions.maxDraft &&
            record.boat.specifications.dimensions.maxDraft.ft,
          displacement:
            record.boat.specifications.dimensions.weights.displacement &&
            record.boat.specifications.dimensions.weights.displacement.value,
          cabins: record.boat.accommodation.cabins,
          doubleBerths: record.boat.accommodation.doubleBerths,
          heads: record.boat.accommodation.heads,
          locationCity: record.location.city,
          locationCountry: countryName,
          createdDate: record.date.created,
          modifiedDate: record.date.modified,
          addedDate: Date.now(),
          link: record.mappedURL,
          description: record.descriptionNoHTML
        }
      })
    )
  }

  async getCountryName(code) {
    const country = await new Promise((resolve, reject) => {
      this.store.countries.findOne({ _id: code }, (err, docs) =>
        err ? reject(err) : resolve(docs)
      )
    })
    return country.name
  }

  isOwnersVersion(listing) {
    if (listing.boat.accommodation.cabins == 3) {
      return true
    } else if (
      listing.descriptionNoHTML
        .toLowerCase()
        .search(/owners version|owner version|owner's version/) > -1
    ) {
      return true
    } else {
      return false
    }
  }

  async getModelFuzzyMatch(makeAndModel) {
    const options = { scorer: fuzz.token_set_ratio }
    const result = fuzz.extract(
      makeAndModel,
      await this.getAllModels(),
      options
    )[0]
    return result[1] < 60 ? 'fail' : result[0]
  }

  async getAllModels() {
    let arr = await new Promise((resolve, reject) => {
      this.store.models.find({}, (err, docs) =>
        err ? reject(err) : resolve(docs)
      )
    })
    return arr.map(mod => mod._id)
  }
}

module.exports = ListingAPI
