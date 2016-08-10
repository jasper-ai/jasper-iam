import test from 'ava'
import hapi from 'hapi'
// import jwt from 'jsonwebtoken'
// import bcrypt from 'bcryptjs'

import plugin from './index'
import authPlugin from '../auth'
import { User, Token } from '../../../orm'

let user
let server

function loadPlugins (server) {
  return new Promise((resolve, reject) => {
    server.register([
      require('hapi-auth-basic'),
      require('hapi-auth-jwt2'),
      require('hapi-statsd'),
      authPlugin,
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
    email: 'jasper-test-handlers-users@jasperdoes.xyz',
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

test.serial('[GET] /users/{id}', async t => {
  const authToken = await Token.tokenize(user.id)
  const headers = { authorization: authToken }

  return new Promise((resolve) => {
    server.inject({
      headers,
      method: 'GET',
      url: `/users/${user.id}`
    }, (response) => {
      if (response.result.error) {
        t.fail(response.result.message)
      }

      resolve()
    })
  })
})

test.serial('[GET] /users', async t => {
  const authToken = await Token.tokenize(user.id)
  const headers = { authorization: authToken }

  return new Promise((resolve) => {
    server.inject({
      headers,
      method: 'GET',
      url: '/users'
    }, (response) => {
      if (response.result.error) {
        t.fail(response.result.message)
      }

      resolve()
    })
  })
})

test.serial('[GET] /users/{id}/tokens', async t => {
  const authToken = await Token.tokenize(user.id)
  const headers = { authorization: authToken }

  return new Promise((resolve) => {
    server.inject({
      headers,
      method: 'GET',
      url: `/users/${user.id}/tokens`
    }, (response) => {
      if (response.result.error) {
        t.fail(response.result.message)
      }

      resolve()
    })
  })
})
