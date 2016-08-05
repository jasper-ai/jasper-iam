import Joi from 'joi'

import {
  createUserHandler,
  deleteUserHandler,
  getUserHandler,
  getUserTokensHandler,
  deleteUserTokenHandler,
  patchUserHandler,
  putUserHandler
} from './handlers'

const userPostPayloadSchema = {
  email: Joi.string().email().required(),
  password: Joi.string().regex(/[a-zA-Z0-9@-_]{3,30}/).required()
}

export const register = (server, options, next) => {
  server.route([
    {
      method: 'GET',
      path: '/users/{id}',
      config: {
        tags: ['api'],
        scope: ['iam:users:read'],
        handler: getUserHandler
      }
    },
    {
      method: 'POST',
      path: '/users',
      config: {
        tags: ['api'],
        scope: ['iam:users:write'],
        validate: {
          payload: userPostPayloadSchema
        },
        handler: createUserHandler
      }
    },
    {
      method: 'PATCH',
      path: '/users/{id}',
      config: {
        tags: ['api'],
        scope: ['iam:users:write'],
        handler: patchUserHandler
      }
    },
    {
      method: 'PUT',
      path: '/users/{id}',
      config: {
        tags: ['api'],
        scope: ['iam:users:write'],
        handler: putUserHandler
      }
    },
    {
      method: 'DELETE',
      path: '/users/{id}',
      config: {
        tags: ['api'],
        scope: ['iam:users:delete'],
        handler: deleteUserHandler
      }
    },
    {
      method: 'GET',
      path: '/users/{id}/tokens',
      config: {
        tags: ['api'],
        scope: ['iam:tokens:read'],
        handler: getUserTokensHandler
      }
    },
    {
      method: 'DELETE',
      path: '/users/{id}/tokens/{tokenId}',
      config: {
        tags: ['api'],
        scope: ['iam:tokens:delete'],
        handler: deleteUserTokenHandler
      }
    }
  ])

  next()
}

register.attributes = {
  name: 'users',
  version: '1.0.0'
}
