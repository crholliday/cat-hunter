// const { GraphQLScalarType } = require('graphql')
// const { Kind } = require('graphql/language')
const { Listing } = require('./entities/listings')
const { Log } = require('./entities/logs')
const { getNewListings } = require('./utils')
const { GraphQLDateTime } = require('graphql-iso-date')

module.exports = {
  Query: {
    allListings: async (_, args, context) => {
      return await Listing.getAll(args)
    },
    favoriteBoats: async (_, __, context) => {
      return await Listing.getFavorites()
    },
    latestLog: async (_, __, context) => {
      return await Log.getLatest()
    },
    allLogs: async (_, args, context) => {
      return await Log.getAll(args)
    }
  },
  Mutation: {
    refreshDatabase: async (_, __, context) => {
      return await getNewListings()
    }
  },
  DateTime: GraphQLDateTime
}
