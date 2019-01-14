const { ApolloServer } = require('apollo-server')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const { createStore } = require('./utils')
const UserAPI = require('./datasources/user')
const CountryAPI = require('./datasources/country')
const ListingAPI = require('./datasources/listing')
const ModelAPI = require('./datasources/model')
const LogAPI = require('./datasources/log')
const { getUserIdFromToken } = require('./auth')

// creates a database connection once. NOT for every request
const store = createStore()

// set up any dataSources our resolvers need
const dataSources = () => ({
  listingAPI: new ListingAPI({ store }),
  countryAPI: new CountryAPI({ store }),
  modelAPI: new ModelAPI({ store }),
  logAPI: new LogAPI({ store }),
  userAPI: new UserAPI({ store })
})

// the function that sets up the global context for each resolver, using the req
const context = async ({ req }) => {
  // simple auth check on every request
  const token = (req.headers && req.headers.authorization) || ''

  // if the email isn't formatted validly, return null for user
  if (!token) return { user: null }

  const userId = getUserIdFromToken(token)

  // find a user by their token

  const user = await new Promise((resolve, reject) => {
    store.users.findOne({ _id: userId }, (err, user) => {
      err ? reject(err) : resolve(user)
    })
  })

  return { user: user }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  context
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
