import Joi from 'joi'

import {
  validateToken,
  getScopes
} from './helpers'

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
async function basic (
  request: Object,
  email: string,
  password: string,
  next: Function
): Promise {
  try {
    const user: User = await User.authenticate(email, password)
    const scope: Array<string> = getScopes(user.get('roles'))

    next(null, true, { user, scope, authType: 'basic' })
  } catch (error) {
    next(error, false)
  }
}

// validate function for JWT plugin
async function jwt (
  decoded: Object,
  request: Object,
  next: Function
): Promise {
  try {
    const token: Token = await Token
      .where({ cuid: decoded.cuid })
      .fetch({ require: true, withRelated: ['user'] })

    await validateToken(token)

    const user: User = await token.related('user')
    const scope: Array<string> = getScopes(user.get('roles'))

    next(null, true, { user, scope, authType: 'jwt' })
  } catch (error) {
    if (error.message === 'EmptyResponse') {
      next(null, false)
    } else {
      next(error, false)
    }
  }
}

module.exports.register = (server, options, next) => {
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
      path: '/auth/basic',
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
      path: '/auth/token',
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

module.exports.register.attributes = {
  name: 'auth',
  version: '1.0.0'
}
