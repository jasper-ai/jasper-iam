import flatten from 'lodash.flatten'
import unique from 'lodash.uniq'

import roles from './roles'
import { Token } from '../../../orm'

class AuthenticationError extends Error {
  constructor (message = 'Authentication failed!') {
    super(message)
    this.message = message
    this.name = 'AuthenticationError'
  }
}

// validate token
export async function validateToken (token: Token): Promise {
  // error is no token found or if token is expired
  if (!token || token.isExpired()) {
    return Promise.reject(new AuthenticationError())
  }

  // update token `last_used` prop to track usage
  return token.save({ last_used: new Date() }, { patch: true })
}

// get scopes for a user
export function getScopes (roleNames: Array<string>): Array<string> {
  return unique(flatten(roleNames.map(roleName => roles[roleName])))
}
