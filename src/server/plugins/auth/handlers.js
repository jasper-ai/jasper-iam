import mg from 'nodemailer-mailgun-transport'
import nodemailer from 'nodemailer'

import { validateToken, getScopes } from './helpers'
import { User, Token } from '../../../orm'

const mgConfig = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
  }
}

const mailer = nodemailer.createTransport(mg(mgConfig))

const sendMail = (messageConfig) => new Promise((resolve, reject) => {
  mailer.sendMail(messageConfig, (error, info) => {
    if (error) return reject(error)
    resolve(info)
  })
})

function getEmailText (url, token) {
  return `
  Here is the link to reset your password!

  ${url}?token=${encodeURIComponent(token)}

  If you did not request this email please contact us at help@jasperdoes.xyz

  Cheers,
  The Jasper Team
  `
}

export function authBasicHandler (req, reply) {
  const { email, password } = req.payload

  User
    .authenticate(email, password)
    .then((user) => {
      reply({
        success: true,
        user: user.id,
        scope: getScopes(user.get('roles')),
        timestamp: Date.now()
      })
    })
    .catch((error) => reply({
      success: false,
      error: error.name,
      message: error.message,
      timestamp: Date.now()
    }))
}

export function authTokenHandler (req, reply) {
  const { cuid } = req.payload

  new Token({ cuid })
    .fetch({ require: true, withRelated: ['users'] })
    .then(validateToken)
    .then((token) => token.related('users'))
    .then((user) => {
      reply({
        success: true,
        user: user.id,
        scope: getScopes(user.roles),
        timestamp: Date.now()
      })
    })
    .catch((error) => reply({
      success: false,
      error: error.name,
      message: error.message,
      timestamp: Date.now()
    }))
}

export function authenticateHandler (req, reply) {
  const { email, password } = req.payload

  User
    .authenticate(email, password)
    .then((user) => {
      // cull all non active tokens on successful login
      user.inactiveTokens()
        .fetch()
        .then((tokens) => tokens.invokeThen('destroy'))

      return Token.tokenize(user.get('id'))
        .then((token) => {
          reply({
            success: true,
            payload: {
              token,
              user: user.get('id'),
              scope: getScopes(user.get('roles'))
            },
            timestamp: Date.now()
          })
        })
    })
    .catch((error) => reply({
      success: false,
      error: error.name,
      message: error.message,
      timestamp: Date.now()
    }))
}

export function passwordResetHandler (req, reply) {
  const { email, url } = req.payload

  new User({ email, active: true })
    .fetch({ require: true })
    .then((user) => Token.tokenize(user.get('id')))
    .then((token) => {
      const messageConfig = {
        to: email,
        from: 'no-reply@jasperdoes.xyz',
        subject: 'Jasper AI - Reset Password',
        text: getEmailText(url, token)
      }

      return sendMail(messageConfig)
    })
    .then(() => reply({
      success: true,
      timestamp: Date.now()
    }))
    .catch((error) => reply({
      success: false,
      error: error.name,
      message: error.message,
      timestamp: Date.now()
    }))
}
