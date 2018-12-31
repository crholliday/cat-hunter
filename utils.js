const axios = require('axios')
const fuzz = require('fuzzball')
const { Model } = require('./entities/models')
const { Listing } = require('./entities/listings')
const { Country } = require('./entities/countries')
const { Log } = require('./entities/logs')
const { API_KEY } = require('./config')

let logEntry = {}

async function getNewListings() {
  let page = 1
  let last = 100
  const ids = await Listing.getAllIds()
  let newListings = []

  do {
    let { lastPage, listings } = await getNewListingsByPage(page, ids)
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
        Listing.insert(newListings)
        // compose log entries
        logEntry.newRecordCount =
          newListings.length > 0 ? newListings.length : 0
        logEntry.totalRecordCount = ids.length + newListings.length
        logEntry.logDate = new Date().toISOString()
        Log.insert(logEntry)
        return `${newListings.length} records added.`
      } else {
        logEntry.newRecordCount = 0
        logEntry.totalRecordCount = ids.length
        logEntry.logDate = new Date().toISOString()
        Log.insert(logEntry)
        return 'No new records found.'
      }
    } else {
      page++
    }
  } while (page <= last)
}

async function getNewListingsByPage(page, ids) {
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
  let url = `https://api-gateway.boats.com/api-yachtworld/search?uom=ft&currency=USD&condition=used&year=2000-&length=40-50&price=200000-375000&created=-100&boatType=sail&class=sail-catamaran&page=${page}&pageSize=50&apikey=a8a286f8f5b54e96a2ff28e7bf6bace2`

  const response = await axios(requestQuery)
  const lastPage = response.data.search.lastPage

  // check if each item is already in our json
  const newRecords = response.data.search.records.filter(record => {
    return ids.findIndex(i => i._id === record.id) === -1
  })

  // format new records to fit our data structure
  let newFormattedBoats = await makeListingRecords(newRecords)

  return {
    lastPage: lastPage,
    listings: newFormattedBoats
  }
}

async function makeListingRecords(records) {
  return Promise.all(
    records.map(async record => {
      let countryName = await getCountryName(record.location.countryCode)
      return {
        _id: record.id,
        make: record.boat.make,
        model: record.boat.model,
        matchedFuzzballModel: await getModelFuzzyMatch(
          record.boat.make + ' ' + record.boat.model
        ),
        year: record.boat.year,
        name: record.boat.normalizedName,
        price: record.price.type && record.price.type.amount['USD'],
        ownersVersion: isOwnersVersion(record),
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

async function getCountryName(code) {
  const country = await Country.find({ _id: code })
  return country.name
}

function isOwnersVersion(listing) {
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

async function getModelFuzzyMatch(makeAndModel) {
  const options = { scorer: fuzz.token_set_ratio }
  const result = fuzz.extract(makeAndModel, await getIds(), options)[0]
  return result[1] < 60 ? 'fail' : result[0]
}

async function getIds() {
  let arr = await Model.getAll()
  return arr.map(mod => mod._id)
}

module.exports = {
  getNewListings
}
