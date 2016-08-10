import test from 'ava'
import bcrypt from 'bcryptjs'

import { User, Token } from './index'

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

test.afterEach.always(async t => {
  const users = await User.collection().fetch()

  await Promise.all(users.map(async u => {
    const tokens = await u.tokens().fetch()
    return tokens.invokeThen('destroy')
  }))

  return users.invokeThen('destroy')
})

test.serial('[User.authenticate] [Static] authentication with valid creds', async t => {
  const hashed = await hash('test')
  const user = await User.forge({
    email: 'user.authenticate1@jasperdoes.xyz',
    password: hashed,
    roles: ['worker-user']
  }).save()

  try {
    const expected = user.id
    const authedUser = await User.authenticate('user.authenticate1@jasperdoes.xyz', 'test')
    const actual = authedUser.id

    t.is(expected, actual)
  } catch (error) {
    t.fail(error.message)
  }
})

test.serial('[User.authenticate] [Static] authentication with invalid creds', async t => {
  const hashed = await hash('test')
  await User.forge({
    email: 'user.authenticate2@jasperdoes.xyz',
    password: hashed,
    roles: ['worker-user']
  }).save()

  try {
    await User.authenticate('user.authenticate2@jasperdoes.xyz', 'wrong')

    t.fail('user should not be authenticated with incorrect email')
  } catch (error) {
    if (error.message === 'Incorrect Username or Password!') {
      t.pass('fails with "Incorrect Username or Password!" error')
    } else {
      t.fail(error.message)
    }
  }
})

test.serial('[User.hashPassword] [Static]', async t => {
  const hash = await User.hashPassword('test')

  const expected = true
  const actual = bcrypt.compareSync('test', hash)

  t.is(expected, actual, 'hashes password proeperly')
})

test.serial('[User.archive] [Method]', async t => {
  const user = await User.forge({
    email: 'user.archive@jasper.xyz',
    password: 'test',
    roles: ['worker-user']
  }).save()

  try {
    await user.archive()

    const updatedUser = await user.refresh()

    const expected = false
    const actual = updatedUser.get('active')

    t.is(expected, actual, 'user should be inactive')
  } catch (error) {
    t.fail(error.message)
  }
})

test.serial('[User.activeTokens] [Method]', async t => {
  const user = await User.forge({
    email: 'user.activetokens@jasper.xyz',
    password: 'test',
    roles: ['worker-user']
  }).save()

  try {
    await Token.tokenize(user.id)
    await Token.tokenize(user.id)

    const tokens = await user.tokens().fetch()
    const token = tokens.first()

    await token.save({ active: false }, { patch: true })

    const activeTokens = await user.activeTokens().fetch()

    const expected = 1
    const actual = activeTokens.length

    t.is(expected, actual, 'should return active tokens')
  } catch (error) {
    t.fail(error.message)
  }
})

test.serial('[User.inactiveTokens] [Method]', async t => {
  const user = await User.forge({
    email: 'user.inactivetokens@jasper.xyz',
    password: 'test',
    roles: ['worker-user']
  }).save()

  try {
    await Token.tokenize(user.id)

    const tokens = await user.tokens().fetch()
    const token = tokens.first()

    await token.save({ active: false }, { patch: true })

    const inactiveTokens = await user.inactiveTokens().fetch()

    const expected = 1
    const actual = inactiveTokens.length

    t.is(expected, actual, 'should return inactive tokens')
  } catch (error) {
    t.fail(error.message)
  }
})
