import test from 'ava'
import jwt from 'jsonwebtoken'

import { User, Token } from './index'

let user

test.beforeEach(async t => {
  user = await User.forge({
    email: 'user.token@jasperdoes.xyz',
    password: 'test',
    roles: ['worker-user']
  }).save()
})

test.afterEach.always(async t => {
  if (user) {
    const tokens = await user.tokens().fetch()
    await tokens.invokeThen('destroy')
    return user.destroy()
  }

  return Promise.resolve()
})

test.serial('[Token.tokenize] [Static]', async t => {
  const token = await Token.tokenize(user.id)
  const decoded = jwt.verify(token, process.env.SECRET)

  const expected = user.id
  const actual = decoded.user_id

  t.is(expected, actual, 'returns a token for the passed in user')
})

test.serial('[Token.isExpired] [Method] with unexpired token', async t => {
  await Token.tokenize(user.id)

  const tokens = await Token.collection().fetch()
  const token = tokens.first()

  const expected = false
  const actual = token.isExpired()

  t.is(expected, actual, 'returns false if token IS NOT expired')
})

test.serial('[Token.isExpired] [Method] with expired token', async t => {
  const thirtyOneDays = new Date(new Date().getDate() - 31)

  await Token.tokenize(user.id)

  const tokens = await Token.collection().fetch()
  const token = tokens.first()

  const updatedToken = await token
    .save({ last_used: thirtyOneDays }, { patch: true })

  const expected = true
  const actual = updatedToken.isExpired()

  t.is(expected, actual, 'returns false if token IS expired')
})
