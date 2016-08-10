import test from 'ava'
import bcrypt from 'bcryptjs'

import { User, Token } from './index'

let user

test.beforeEach(async t => {
  const hashed = await User.hashPassword('test')
  user = await User.forge({
    email: 'jasper-test-orm-users@jasperdoes.xyz',
    password: hashed,
    roles: ['worker-user']
  }).save()

  return Promise.resolve()
})

test.afterEach.always(async t => {
  const tokens = await user.tokens().fetch()
  await tokens.invokeThen('destroy')
  return user.destroy()
})

test.serial('[User.authenticate] authentication with valid creds', async t => {
  try {
    const expected = user.id
    const authedUser = await User.authenticate('jasper-test-orm-users@jasperdoes.xyz', 'test')
    const actual = authedUser.id

    t.is(expected, actual)
  } catch (error) {
    t.fail(error.message)
  }
})

test.serial('[User.authenticate] authentication with invalid creds', async t => {
  try {
    await User.authenticate('jasper-test-orm-users@jasperdoes.xyz', 'wrong')

    t.fail('user should not be authenticated with incorrect email')
  } catch (error) {
    if (error.message === 'Unauthorized!') {
      t.pass('fails with "Unauthorized!" error')
    } else {
      t.fail(error.message)
    }
  }
})

test.serial('[User.hashPassword]', async t => {
  const hash = await User.hashPassword('test')

  const expected = true
  const actual = bcrypt.compareSync('test', hash)

  t.is(expected, actual, 'hashes password proeperly')
})

test.serial('[User.archive]', async t => {
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

test.serial('[User.activeTokens]', async t => {
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

test.serial('[User.inactiveTokens]', async t => {
  try {
    await Token.tokenize(user.id)

    const tokens = await user.tokens().fetch()
    const token = tokens.first()

    await token.save({ active: false }, { patch: true })

    const inactiveTokens = await user.inactiveTokens().fetch()

    const expected = true
    const actual = inactiveTokens.length > 0

    t.is(expected, actual, 'should return inactive tokens')
  } catch (error) {
    t.fail(error.message)
  }
})
