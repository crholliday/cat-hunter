const jwt = require('jsonwebtoken')
const { APP_SECRET } = require('./config')

function getUserIdFromToken(jwtToken) {
  let token = ''

  if (jwtToken) token = jwtToken.replace('Bearer ', '')

  if (token) {
    try {
      const { userId } = jwt.verify(token, APP_SECRET)
      return userId
    } catch (err) {
      // throw new AuthError()
      return null
    }
  }

  // throw new AuthError()
  return null
}

function createToken(userId) {
  return jwt.sign({ userId: userId }, APP_SECRET, {
    expiresIn: '7d'
  })
}

class AuthError extends Error {
  constructor() {
    super('Not authorized')
  }
}

module.exports = {
  getUserIdFromToken,
  createToken
  // AuthError
}
