import Hapi from 'hapi'

import serverConfig from './config'

export function getServer () {
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

export async function loadPlugins (server) {
  return new Promise((resolve, reject) => {
    server.register(serverConfig, (error) => {
      if (error) {
        reject(error)
        return
      }

      resolve(server)
    })
  })
}

export async function start (server) {
  return new Promise((resolve, reject) => {
    server.start(error => {
      if (error) return reject(error)
      resolve(server)
    })
  })
}
