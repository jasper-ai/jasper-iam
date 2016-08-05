import test from 'ava'
import bcrypt from 'bcryptjs'

import { User } from './index'

function hash (password) {
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

test('authentication with valid creds', (t) => {
  return new Promise((resolve, reject) => {
    hash('test')
      .then((hashed) => {
        User.forge({
          email: 'test@jasperdoes.xyz',
          password: hashed,
          roles: ['worker-user']
        })
        .save()
        .then((user) => {
          const expected = user.get('id')

          return User
            .authenticate('test@jasperdoes.xyz', 'test')
            .then((authedUser) => {
              const actual = authedUser.get('id')
              t.is(expected, actual)
            })
            .then(() => user.tokens().invokeThen('destroy'))
            .then(() => user.destroy())
            .then(() => resolve())
            .catch((error) => reject(error))
        })
        .catch((error) => reject(error))
      })
  })
})

test('authentication with invalid creds', (t) => {
  let userModel
  return new Promise((resolve, reject) => {
    User.forge({
      email: 'test@jasper.xyz',
      password: 'test',
      roles: ['worker-user']
    })
    .save()
    .then((user) => {
      userModel = user

      User
        .authenticate('test@jasperdoes.xyz', 'wrong')
        .then(() => {
          t.fail('user should not be authenticated with incorrect email')
          resolve()
        })
        .catch((error) => {
          if (error.message === 'Incorrect Username or Password!') {
            t.pass('fails with "Incorrect Username or Password!" error')
          }

          const promises = [
            userModel.tokens().invokeThen('destroy'),
            userModel.destroy()
          ]

          Promise.all(promises)
            .then(() => resolve())
            .catch((error) => reject(error))
        })
    })
  })
})
