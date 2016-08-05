import bcrypt from 'bcryptjs'

module.exports.register = (server, options, next) => {
  function hash (password, next) {
    bcrypt.genSalt(10, (error, salt) => {
      if (error) {
        next(error)
        return
      }

      bcrypt.hash(password, salt, (error, hash) => {
        if (error) {
          next(error)
          return
        }

        next(null, hash)
      })
    })
  }

  server.method('hash', hash)

  next()
}

module.exports.register.attributes = {
  name: 'methods',
  version: '1.0.0'
}
