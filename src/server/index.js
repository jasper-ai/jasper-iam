import Hapi from 'hapi'

import serverConfig from './config'

export const getServer = () => {
  const server = new Hapi.Server({
    connections: {
      routes: {
        cors: true
      }
    }
  })

  server.connection({
    port: process.env.PORT || 3000
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
