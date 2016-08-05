const defaultPlugins = [
  // authentication
  { register: require('hapi-auth-basic') },
  { register: require('hapi-auth-jwt2') },

  // metrics
  { register: require('jasper-hapi-healthcheck') },
  { register: require('jasper-hapi-metrics') }
]

const developmentPlugins = [
  // logging
  { register: require('hapi-pino') },

  // app
  { register: require('./plugins/methods') },
  { register: require('./plugins/auth') },
  { register: require('./plugins/users') },
  { register: require('./plugins/tokens') }
]

const testPlugins = [
  // app
  { register: require('./plugins/methods') },
  { register: require('./plugins/auth') },
  { register: require('./plugins/users') },
  { register: require('./plugins/tokens') }
]

const productionPlugins = [
  // logging
  { register: require('hapi-pino') },

  // documentation
  { register: require('inert') },
  { register: require('vision') },
  { register: require('hapi-swagger') },

  // app
  { register: require('./plugins/methods') },
  { register: require('./plugins/auth') },
  { register: require('./plugins/users') },
  { register: require('./plugins/tokens') }
]

let plugins

switch (process.env.NODE_ENV) {
  case 'development':
    plugins = defaultPlugins.concat(developmentPlugins)
    break
  case 'test':
    plugins = defaultPlugins.concat(testPlugins)
    break
  case 'production':
    plugins = defaultPlugins.concat(productionPlugins)
    break
  default:
    plugins = defaultPlugins.concat(developmentPlugins)
    break
}

export default plugins
