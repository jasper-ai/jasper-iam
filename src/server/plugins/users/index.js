import Joi from 'joi'

import {
  createUserHandler,
  deleteUserHandler,
  getUserHandler,
  getUsersHandler,
  getUserTokensHandler,
  deleteUserTokenHandler,
  patchUserHandler,
  putUserHandler
} from './handlers'

const userPostPayloadSchema = {
  email: Joi.string().email().required(),
  password: Joi.string().regex(/[a-zA-Z0-9@-_]{3,30}/).required()
}

module.exports.register = (server, options, next) => {
  server.route([
    {
      method: 'GET',
      path: '/users',
      config: {
        tags: ['api'],
        auth: {
          scope: ['iam:users:read']
        },
        handler: getUsersHandler
      }
    },
    {
      method: 'GET',
      path: '/users/{id}',
      config: {
        tags: ['api'],
        auth: {
          scope: ['iam:users:read']
        },
        handler: getUserHandler
      }
    },
    {
      method: 'POST',
      path: '/users',
      config: {
        tags: ['api'],
        auth: {
          scope: ['iam:users:write']
        },
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
        auth: {
          scope: ['iam:users:write']
        },
        handler: patchUserHandler
      }
    },
    {
      method: 'PUT',
      path: '/users/{id}',
      config: {
        tags: ['api'],
        auth: {
          scope: ['iam:users:write']
        },
        handler: putUserHandler
      }
    },
    {
      method: 'DELETE',
      path: '/users/{id}',
      config: {
        tags: ['api'],
        auth: {
          scope: ['iam:users:delete']
        },
        handler: deleteUserHandler
      }
    },
    {
      method: 'GET',
      path: '/users/{id}/tokens',
      config: {
        tags: ['api'],
        auth: {
          scope: ['iam:tokens:read']
        },
        handler: getUserTokensHandler
      }
    },
    {
      method: 'DELETE',
      path: '/users/{id}/tokens/{tokenId}',
      config: {
        tags: ['api'],
        auth: {
          scope: ['iam:tokens:delete']
        },
        handler: deleteUserTokenHandler
      }
    }
  ])

  next()
}

module.exports.register.attributes = {
  name: 'users',
  version: '1.0.0'
}
