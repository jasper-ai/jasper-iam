import test from 'ava'
import bcrypt from 'bcryptjs'

import { User } from './index'

async function hash (password: string) {
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

test('authentication with valid creds', async (t) => {
  const hashed = await hash('test')
  const user = await User.forge({
    email: 'test@jasperdoes.xyz',
    password: hashed,
    roles: ['worker-user']
  }).save()
  const expected = user.get('id')

  const authedUser = await User.authenticate('test@jasperdoes.xyz', 'test')
  const actual = authedUser.get('id')

  t.is(expected, actual)
  await user.tokens().invokeThen('destroy')
  await user.destroy()
})

test('authentication with invalid creds', async (t) => {
  const user = await User.forge({
    email: 'test@jasper.xyz',
    password: 'test',
    roles: ['worker-user']
  }).save()

  try {
    await User.authenticate('test@jasperdoes.xyz', 'wrong')
    t.fail('user should not be authenticated with incorrect email')
  } catch (error) {
    if (error.message === 'Incorrect Username or Password!') {
      t.pass('fails with "Incorrect Username or Password!" error')
    } else {
      t.fail(error.message)
    }
  }

  await user.tokens().invokeThen('destroy')
  await user.destroy()
})
