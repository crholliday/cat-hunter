const { gql } = require('apollo-server')

const typeDefs = gql`
  type Query {
    allListings(input: BoatWhereInput): [BoatListing!]!
    favoriteBoats: [BoatListing!]!
    latestLog: Log!
    allLogs: [Log!]!
    me: User
  }
  type Mutation {
    refreshDatabase: String
    signup(email: String!, password: String!, name: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    refreshToken(token: String!): String!
    addFavorite(listingId: Int!): User!
    removeFavorite(listingId: Int!): User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    _id: ID!
    email: String!
    name: String!
    favorites: [Int]
  }

  type Favorite {
    user: User!
    listing: BoatListing!
  }

  type Log {
    _id: Int!
    logDate: DateTime!
    newRecordCount: Int!
    totalRecordCount: Int!
  }
  type BoatListing {
    _id: Int!
    make: String!
    model: String!
    matchedFuzzballModel: String!
    year: Int!
    name: String
    price: Float!
    ownersVersion: Boolean!
    length: Float
    beam: Float
    draft: Float
    displacement: Float
    cabins: Int
    doubleBerths: Int
    heads: Int
    locationCity: String!
    locationCountry: String
    createdDate: DateTime!
    modifiedDate: DateTime!
    link: String!
    description: String
  }

  input BoatWhereInput {
    _id: Int
    make: String
    model: String
    year: Int
    price: Float
    ownersVersion: Boolean
    length: Float
    cabins: Int
    doubleBerths: Int
    heads: Int
    createdDate: DateTime
    modifiedDate: DateTime
  }

  scalar DateTime
`

module.exports = typeDefs
