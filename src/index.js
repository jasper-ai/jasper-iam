import hapi from 'hapi'
import { getServer, loadPlugins, start } from './server'

const server: hapi.Server = getServer()

try {
  loadPlugins(server)
  start(server)
} catch (error) {
  console.error(error)
}
