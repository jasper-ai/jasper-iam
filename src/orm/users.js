import bcrypt from 'bcryptjs'

import orm from './orm'

class UnauthorizedError extends Error {
  constructor (message: string = 'Unauthorized!') {
    super(message)
    this.message = message
    this.name = 'UnauthorizedError'
  }
}

async function archiveDependencies (model: User) {
  const tokens = await model.tokens().fetch()
  return tokens.invokeThen('archive')
}

async function comparePassword (password: string, user: User): Promise {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.get('password'), (error, same) => {
      if (error) {
        reject(error)
        return
      }

      if (!same) {
        reject(new UnauthorizedError('Incorrect Username or Password!'))
        return
      }

      resolve(user)
    })
  })
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

        resolve(null, hash)
      })
    })
  })
}

const config = {
  tableName: 'users',

  hasTimestamps: true,

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
    const today = new Date()
    const thirtyDays = new Date().setDate(today.getDate() - 30)

    return this.hasMany('Token')
      .query(queryBuilder =>
        queryBuilder
          .where('last_used', '>', thirtyDays)
          .andWhere({ active: true }))
  },

  inactiveTokens () {
    const today = new Date()
    const thirtyDays = new Date().setDate(today.getDate() - 30)

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

const statics = {
  hashPassword,
  authenticate (email: string, password: string) {
    return new this({ email, active: true })
      .fetch({ require: true })
      .then(user => comparePassword(password, user))
  }
}

export const User = orm.Model.extend(config, statics)
orm.model('User', User)
