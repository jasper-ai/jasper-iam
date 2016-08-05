import { getServer, loadPlugins, start } from './server'

loadPlugins(getServer())
  .then((server) => start(server))
  .catch((err) => console.error(err))
