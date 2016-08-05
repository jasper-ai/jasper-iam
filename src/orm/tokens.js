import jwt from 'jsonwebtoken'
import cuid from 'cuid'

import orm from './orm'

const config = {
  tableName: 'tokens',

  hasTimestamps: true,

  isExpired () {
    const today = new Date()
    const thirtyDays = new Date().setDate(today.getDate() - 30)

    return this.get('last_used') < thirtyDays
  },

  user () {
    return this.belongsTo('User').query({ where: { active: true } })
  },

  archive () {
    return this.save({ active: false }, { patch: true })
  }
}

const statics = {
  tokenize (userId) {
    const unique = cuid()

    return new Promise((resolve, reject) => {
      this.forge({ cuid: unique, user_id: userId })
        .save()
        .then(() => jwt.sign({ cuid: unique }, process.env.SECRET || 'SECRET'))
        .then((token) => resolve(token))
        .catch((error) => reject(error))
    })
  }
}

export const Token = orm.Model.extend(config, statics)
orm.model('Token', Token)
