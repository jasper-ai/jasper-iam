import test from 'ava'
import hapi from 'hapi'
import jwt from 'jsonwebtoken'

import plugin from './index'
import { User, Token } from '../../../orm'

let user
let server

function loadPlugins (server) {
  return new Promise((resolve, reject) => {
    server.register([
      require('hapi-auth-basic'),
      require('hapi-auth-jwt2'),
      plugin
    ], (error) => {
      if (error) return reject(error)
      else resolve()
    })
  })
}

test.beforeEach(async t => {
  const hashed = await User.hashPassword('test')
  user = await User.forge({
    email: 'jasper-test-handlers-auth@jasperdoes.xyz',
    password: hashed,
    roles: ['iam-super']
  }).save()

  server = new hapi.Server()
  server.connection()

  return loadPlugins(server)
})

test.afterEach.always(async t => {
  const tokens = await user.tokens().fetch()
  await tokens.invokeThen('destroy')
  return user.destroy()
})

test.serial('[POST] /auth/basic', async t => {
  const authToken = await Token.tokenize(user.id)
  const headers = { authorization: authToken }

  return new Promise((resolve) => {
    server.inject({
      headers,
      method: 'POST',
      url: '/auth/basic',
      payload: { email: user.get('email'), password: 'test' }
    }, (response) => {
      if (response.result.error) {
        t.fail(response.result.message)
      }

      resolve()
    })
  })
})

test.serial('[POST] /auth/token', async t => {
  const token = await Token.tokenize(user.id)
  const cuid = jwt.verify(token, process.env.SECRET).cuid
  const authToken = await Token.tokenize(user.id)
  const headers = { authorization: authToken }

  return new Promise((resolve) => {
    server.inject({
      headers,
      method: 'POST',
      url: '/auth/token',
      payload: { cuid }
    }, (response) => {
      if (response.result.error) {
        t.fail(response.result.message)
      }

      resolve()
    })
  })
})
