import bcrypt from 'bcryptjs'

import orm from './orm'

class UnauthorizedError extends Error {
  constructor (message: string = 'Unauthorized!') {
    super(message)
    this.message = message
    this.name = 'UnauthorizedError'
  }
}

function validatePassword (given: string, actual: string): Promise {
  return new Promise((resolve, reject) => {
    bcrypt.compare(given, actual, (error, same) => {
      if (error) {
        reject(error)
        return
      }

      resolve(same)
    })
  })
}

async function authenticate (email: string, password: string): Promise {
  let user
  let valid

  try {
    user = await new this()
      .where({ email, active: true })
      .fetch({ require: true })
  } catch (error) {
    if (error.message === 'EmptyResponse') {
      return Promise.reject(new UnauthorizedError())
    }

    return Promise.reject(error)
  }

  try {
    valid = await validatePassword(password, user.get('password'))
  } catch (error) {
    return Promise.reject(error)
  }

  if (!valid) return Promise.reject(new UnauthorizedError())
  return Promise.resolve(user)
}

function hashPassword (password: string): Promise {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (error, salt) => {
      if (error) {
        reject(error)
        return
      }

      bcrypt.hash(password, salt, (error, hash) => {
        if (error) {
          reject(error)
          return
        }

        resolve(hash)
      })
    })
  })
}

async function archiveDependencies (model: User): Promise {
  const tokens = await model.tokens().fetch()
  return tokens.invokeThen('archive')
}

const config = {
  tableName: 'users',

  hasTimestamps: true,

  defaults: {
    active: true
  },

  virtuals: {
    roles: {
      get () {
        return this.get('_roles').split(',')
      },

      set (roles) {
        this.set('_roles', roles.join(','))
      }
    }
  },

  activeTokens () {
    const thirtyDays = new Date(new Date().getDate() - 30)

    return this.hasMany('Token')
      .query(queryBuilder =>
        queryBuilder
          .where('last_used', '>', thirtyDays)
          .andWhere({ active: true }))
  },

  inactiveTokens () {
    const thirtyDays = new Date(new Date().getDate() - 30)

    return this.hasMany('Token')
      .query(queryBuilder =>
        queryBuilder
          .where('last_used', '>', thirtyDays)
          .orWhere({ active: false }))
  },

  tokens () {
    return this.hasMany('Token')
  },

  archive () {
    return archiveDependencies(this)
      .then(() => this.save({ active: false }, { patch: true }))
  }
}

const statics = { authenticate, hashPassword }

export const User = orm.Model.extend(config, statics)
orm.model('User', User)
