import Joi from 'joi'

import { validateToken, getScopes } from './helpers'
import {
  authBasicHandler,
  authTokenHandler,
  authenticateHandler,
  passwordResetHandler
} from './handlers'
import { User, Token } from '../../../orm'

const authBasicPayloadSchema = {
  email: Joi.string().email().required(),
  password: Joi.string().regex(/[a-zA-Z0-9@-_]{3,30}/).required()
}

const authTokenPayloadSchema = {
  cuid: Joi.string().required()
}

const resetPasswordPayloadSchema = {
  email: Joi.string().email().required(),
  url: Joi.string().required()
}

// validate function for basic auth plugin
function basic (request, email, password, next) {
  User.authenticate(email, password)
    .then((user) => next(null, true, {
      user,
      scope: getScopes(user.get('roles')),
      authType: 'basic'
    }))
    .catch((error) => next(error, false))
}

// validate function for JWT plugin
function jwt (decoded, request, next) {
  Token
    .where({ cuid: decoded.cuid })
    .fetch({ require: true, withRelated: ['users'] })
    .then(validateToken)
    .then((token) => token.related('users'))
    .then((user) => next(null, true, {
      user,
      scope: getScopes(user.get('roles')),
      authType: 'jwt'
    }))
    .catch((error) => next(error, false))
}

export const register = (server, options, next) => {
  server.auth.strategy('basic', 'basic', { validateFunc: basic })
  server.auth.strategy('jwt', 'jwt', {
    key: process.env.SECRET || 'SECRET',
    validateFunc: jwt,
    verifyOptions: { algorithms: ['HS256'] }
  })

  server.auth.default({ strategies: ['basic', 'jwt'] })

  server.route([
    {
      method: 'POST',
      path: '/pwreset',
      config: {
        tags: ['api'],
        auth: {
          scope: ['iam:pwreset']
        },
        validate: {
          payload: resetPasswordPayloadSchema
        },
        handler: passwordResetHandler
      }
    },
    {
      method: 'POST',
      path: '/auth/check/basic',
      config: {
        tags: ['api'],
        auth: {
          scope: ['iam:auth:check']
        },
        validate: {
          payload: authBasicPayloadSchema
        },
        handler: authBasicHandler
      }
    },
    {
      method: 'POST',
      path: '/auth/check/token',
      config: {
        tags: ['api'],
        auth: {
          scope: ['iam:auth:check']
        },
        validate: {
          payload: authTokenPayloadSchema
        },
        handler: authTokenHandler
      }
    },
    {
      method: 'POST',
      path: '/authenticate',
      config: {
        tags: ['api'],
        auth: {
          scope: ['iam:authenticate']
        },
        validate: {
          payload: authBasicPayloadSchema
        },
        handler: authenticateHandler
      }
    }
  ])

  next()
}

register.attributes = {
  name: 'auth',
  version: '1.0.0'
}
