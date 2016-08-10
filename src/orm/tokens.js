import jwt from 'jsonwebtoken'
import cuid from 'cuid'

import orm from './orm'

const config = {
  tableName: 'tokens',

  hasTimestamps: true,

  defaults: {
    last_used: new Date()
  },

  isExpired () {
    const thirtyDays = new Date(new Date().getDate() - 30)
    return this.get('last_used') < thirtyDays
  },

  user () {
    return this.belongsTo('User')
  },

  archive () {
    return this.save({ active: false }, { patch: true })
  }
}

const statics = {
  tokenize (userId) {
    const unique = cuid()

    return new Promise((resolve, reject) => {
      this.forge({ cuid: unique, user_id: userId }).save()
        .then(token =>
          jwt.sign({
            cuid: token.get('cuid'),
            user_id: token.get('user_id')
          }, process.env.SECRET || 'SECRET'))
        .then(jwt => resolve(jwt))
        .catch(error => reject(error))
    })
  }
}

export const Token = orm.Model.extend(config, statics)
orm.model('Token', Token)
