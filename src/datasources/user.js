const { DataSource } = require('apollo-datasource')
const isEmail = require('isemail')

class UserAPI extends DataSource {
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

  /**
   * User can be called with an argument that includes email, but it doesn't
   * have to be. If the user is already on the context, it will use that user
   * instead
   */
  find(args) {
    const email =
      this.context && this.context.user ? this.context.user.email : args.email
    if (!email || !isEmail.validate(email)) return null

    // store is a reference to the database so you can use NEDB calls
    return new Promise((resolve, reject) => {
      this.store.users.find(args, (err, user) => {
        err ? reject(err) : resolve(user && user[0])
      })
    })
  }

  addFavorite(listingId) {
    const userId = this.context.user._id
    if (!userId) return

    return new Promise((resolve, reject) => {
      this.store.users.update(
        { _id: userId },
        { $addToSet: { favorites: listingId } },
        { returnUpdatedDocs: true },
        (err, _, user) => {
          err ? reject(err) : resolve(user)
        }
      )
    })
  }

  removeFavorite(listingId) {
    const userId = this.context.user._id
    if (!userId) return

    return new Promise((resolve, reject) => {
      this.store.users.update(
        { _id: userId },
        { $pull: { favorites: listingId } },
        { returnUpdatedDocs: true },
        (err, _, user) => {
          err ? reject(err) : resolve(user)
        }
      )
    })
  }

  addUser(contents) {
    return new Promise((resolve, reject) => {
      let user = {
        name: contents.data.name,
        email: contents.data.email,
        password: contents.data.password
      }
      this.store.users.insert(user, (err, newUser) => {
        err ? reject(err) : resolve(newUser)
      })
    })
  }
}

module.exports = UserAPI
