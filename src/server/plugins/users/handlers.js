import assign from 'lodash.assign'

import { User } from '../../../orm'

function deleteUser (user) {
  return user.archive()
}

function patchUser (user, payload, hasher) {
  if (!payload.password) return user.save(payload, { patch: true })

  return hasher(payload.password)
    .then((hashed) => assign({}, payload, { password: hashed }))
    .then((data) => user.save(data, { patch: true }))
}

function putUser (user, payload, hasher) {
  if (!payload.password) return user.save(payload)

  return hasher(payload.password)
    .then((hashed) => assign({}, payload, { password: hashed }))
    .then((data) => user.save(data))
}

export function getUserHandler (req, reply) {
  const { id } = req.params

  new User({ id, active: true })
    .fetch({ require: true })
    .then((user) => reply({
      success: true,
      user: user.id,
      timestamp: Date.now()
    }))
    .catch((error) => reply({
      success: false,
      error: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    }))
}

export function getUserTokensHandler (req, reply) {
  const { id } = req.params

  new User({ id, active: true })
    .fetch({ require: true, withRelated: ['tokens'] })
    .then((user) => user.related('tokens'))
    .then((tokens) => reply({
      tokens,
      success: true,
      user: id,
      timestamp: Date.now()
    }))
    .catch((error) => reply({
      success: false,
      error: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    }))
}

export function createUserHandler (req, reply) {
  User.forge(req.payload)
    .save()
    .then((user) => reply({
      success: true,
      user: user.id,
      timestamp: Date.now()
    }))
    .catch((error) => reply({
      success: false,
      error: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    }))
}

export function patchUserHandler (req, reply) {
  const { id } = req.params

  new User({ id, active: true })
    .fetch({ require: true })
    .then((user) => patchUser(user, req.payload, req.server.methods.hash))
    .then((user) => reply({
      success: true,
      user: user.id,
      timestamp: Date.now()
    }))
    .catch((error) => reply({
      success: false,
      error: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    }))
}

export function putUserHandler (req, reply) {
  const { id } = req.params

  new User({ id, active: true })
    .fetch({ require: true })
    .then((user) => putUser(user, req.payload, req.server.methods.hash))
    .then((user) => reply({
      success: true,
      user: user.id,
      timestamp: Date.now()
    }))
    .catch((error) => reply({
      success: false,
      error: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    }))
}

export function deleteUserHandler (req, reply) {
  const { id } = req.params

  new User({ id, active: true })
    .fetch({ require: true })
    .then((user) => deleteUser(user))
    .then(() => reply({
      success: true,
      timestamp: Date.now()
    }))
    .catch((error) => reply({
      success: false,
      error: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    }))
}
