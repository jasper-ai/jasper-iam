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

async function sendMail (messageConfig: any): Promise {
  return new Promise((resolve, reject) => {
    mailer.sendMail(messageConfig, (error, info) => {
      if (error) return reject(error)
      resolve(info)
    })
  })
}

function getEmailText (url: string, token: string): string {
  return `
  Here is the link to reset your password!

  ${url}?token=${encodeURIComponent(token)}

  If you did not request this email please contact us at help@jasperdoes.xyz

  Cheers,
  The Jasper Team
  `
}

export async function authBasicHandler (req, reply) {
  const { email, password } = req.payload

  try {
    const user: User = await User.authenticate(email, password)

    reply({
      success: true,
      user: user.id,
      scope: getScopes(user.get('roles')),
      timestamp: Date.now()
    })
  } catch (error) {
    reply({
      success: false,
      error: error.name,
      message: error.message,
      timestamp: Date.now()
    }).code(401)
  }
}

export async function authTokenHandler (req, reply) {
  const { cuid } = req.payload

  try {
    const token: Token = await new Token({ cuid })
      .fetch({ require: true, withRelated: ['user'] })

    await validateToken(token)

    const user: User = token.related('user')

    reply({
      success: true,
      user: user.id,
      scope: getScopes(user.get('roles')),
      timestamp: Date.now()
    })
  } catch (error) {
    reply({
      success: false,
      error: error.name,
      message: error.message,
      timestamp: Date.now()
    }).code(401)
  }
}

export async function authenticateHandler (req, reply) {
  const { email, password } = req.payload

  try {
    const user: User = await User.authenticate(email, password)
    const token: Token = await Token.tokenize(user.get('id'))

    reply({
      success: true,
      payload: {
        token,
        user: user.id,
        scope: getScopes(user.get('roles'))
      },
      timestamp: Date.now()
    })

    const inactiveTokens = await user.inactiveTokens().fetch()
    inactiveTokens.invokeThen('destroy')
  } catch (error) {
    reply({
      success: false,
      error: error.name,
      message: error.message,
      timestamp: Date.now()
    }).code(401)
  }
}

export async function passwordResetHandler (req, reply) {
  const { email, url } = req.payload

  try {
    const user: User = new User({ email, active: true })
      .fetch({ require: true })
    const token: Token = await Token.tokenize(user.get('id'))
    const messageConfig = {
      to: email,
      from: 'no-reply@jasperdoes.xyz',
      subject: 'Jasper AI - Reset Password',
      text: getEmailText(url, token)
    }

    await sendMail(messageConfig)

    reply({
      success: true,
      timestamp: Date.now()
    })
  } catch (error) {
    reply({
      success: false,
      error: error.name,
      message: error.message,
      timestamp: Date.now()
    }).code(401)
  }
}
