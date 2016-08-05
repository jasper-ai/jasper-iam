import bookshelfFactory from 'bookshelf'
import knexFactory from 'knex'

const knex = knexFactory({
  client: 'pg',
  connection: {
    port: process.env.DATABASE_PORT,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_ACCESS_KEY,
    database: process.env.DATABASE_NAME
  }
})

const bookshelf = bookshelfFactory(knex)
bookshelf.plugin('registry')
bookshelf.plugin('virtuals')

export default bookshelf
