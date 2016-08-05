import flatten from 'lodash.flatten'
import unique from 'lodash.uniq'

import roles from './roles'

class AuthenticationError extends Error {
  constructor (message = 'Authentication failed!') {
    super(message)
    this.message = message
    this.name = 'AuthenticationError'
  }
}

// validate token
export function validateToken (token) {
  // error is no token found or if token is expired
  if (!token || token.isExpired()) {
    return Promise.reject(new AuthenticationError())
  }

  // update token `updatedAt` prop to track usage
  return token.update({ lastActive: new Date() })
    .then(token.reload)
    .then(() => token)
}

// get scopes for a user
export function getScopes (roleNames) {
  return unique(flatten(roleNames.map(roleName => roles[roleName])))
}
