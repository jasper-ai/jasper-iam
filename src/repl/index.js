import repl from 'repl'

import { User, Token } from '../orm'
import { getServer, loadPlugins } from '../server'

const users = User.collection()
const tokens = Token.collection()

const server = getServer()

Promise.all([
  users.fetch(),
  tokens.fetch(),
  loadPlugins(server)
]).then(results => {
  const replServer = repl.start({
    prompt: `Jasper API (${process.env.NODE_ENV}): `
  })

  replServer.context.users = results[0]
  replServer.context.tokens = results[1]

  replServer.context.User = User
  replServer.context.Token = Token

  replServer.context.server = server
})
.catch(err => console.log(err))
