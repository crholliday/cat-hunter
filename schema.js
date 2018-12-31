const { gql } = require('apollo-server')

const typeDefs = gql`
  type Query {
    allListings(input: BoatWhereInput): [BoatListing!]!
    favoriteBoats: [BoatListing!]!
    latestLog: Log!
    allLogs: [Log!]!
  }
  type Mutation {
    refreshDatabase: String
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
    locationCountry: String!
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
