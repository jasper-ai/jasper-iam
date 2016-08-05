import bcrypt from 'bcryptjs'

import orm from './orm'

class UnauthorizedError extends Error {
  constructor (message = 'Unauthorized!') {
    super(message)
    this.message = message
    this.name = 'UnauthorizedError'
  }
}

function archiveDependencies (model) {
  model.tokens().fetch()
    .then((tokens) => tokens.invokeThen('archive'))
}

function comparePassword (password, user) {
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
      .query((queryBuilder) =>
        queryBuilder.where('last_used', '>', thirtyDays))
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
  authenticate (email, password) {
    return new this({ email, active: true })
      .fetch({ require: true })
      .catch((error) => console.log(error))
      .then((user) => comparePassword(password, user))
  }
}

export const User = orm.Model.extend(config, statics)
orm.model('User', User)
