const bcrypt = require('bcryptjs')
const { createToken } = require('./auth')
const { GraphQLDateTime } = require('graphql-iso-date')

module.exports = {
  Query: {
    allListings: async (_, args, { dataSources }) => {
      return await dataSources.listingAPI.getAll(args)
    },
    favoriteBoats: async (_, __, { dataSources }) => {
      return await dataSources.listingAPI.getFavorites()
    },
    latestLog: async (_, __, { dataSources }) => {
      return await dataSources.logAPI.getLatest()
    },
    allLogs: async (_, args, { dataSources }) => {
      return await dataSources.logAPI.getAll(args)
    },
    me: async (_, __, { user, dataSources }, info) => {
      if (user && user._id) return user
      return null
    }
  },
  Mutation: {
    refreshDatabase: async (_, __, { dataSources }) => {
      return await dataSources.listingAPI.getNewListings()
    },
    async signup(parent, args, { dataSources }, info) {
      let userTst = await dataSources.userAPI.find({ email: args.email })

      if (userTst) {
        throw new Error('User already exits')
      }

      const password = await bcrypt.hash(args.password, 10)
      const user = await dataSources.userAPI.addUser({
        data: { ...args, password }
      })

      // expires in 7 days
      return {
        token: createToken(user._id),
        user
      }
    },

    async refreshToken(parent, { token }, { dataSources }) {
      const userId = dataSources.userAPI.getUserIdFromToken(token)
      return createToken(userId)
    },

    async addFavorite(_, { listingId }, { dataSources }) {
      return await dataSources.userAPI.addFavorite(listingId)
    },

    async removeFavorite(_, { listingId }, { dataSources }) {
      return await dataSources.userAPI.removeFavorite(listingId)
    },

    async login(parent, { email, password }, { dataSources }) {
      const user = await dataSources.userAPI.find({ email: email })

      if (!user) {
        throw new Error(`No such user found for email: ${email}`)
      }

      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        throw new Error('Invalid password')
      }

      // expires in 7 days
      return {
        token: createToken(user._id),
        user
      }
    }
  },
  DateTime: GraphQLDateTime
}
