import Hapi from 'hapi'

import serverConfig from './config'

export const getServer = (host, port) => {
  const server = new Hapi.Server({
    connections: {
      routes: {
        cors: true
      }
    }
  })

  server.connection({
    port: port || process.env.PORT
  })

  return server
}

export const loadPlugins = (server) => new Promise((resolve, reject) => {
  server.register(serverConfig, (error) => {
    if (error) {
      reject(error)
      return
    }

    resolve(server)
  })
})

export const start = (server) => new Promise((resolve, reject) => {
  server.start((error) => {
    if (error) return reject(error)
    resolve(server)
  })
})
