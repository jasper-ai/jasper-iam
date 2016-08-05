exports.up = function up (knex) {
  return knex.schema
    .createTable('users', function usersTable (table) {
      table.increments('id').primary()
      table.text('email').notNullable().unique()
      table.text('password').notNullable()
      table.text('_roles').notNullable()
      table.boolean('active').defaultTo(true)
      table.jsonb('extra_data')
      table.timestamps()
    })
    .createTable('tokens', function tokensTable (table) {
      table.increments('id').primary()
      table.integer('user_id').notNullable().references('users.id')
      table.text('cuid')
      table.boolean('active').defaultTo(true)
      table.dateTime('last_used').defaultTo(knex.fn.now())
      table.jsonb('extra_data')
      table.timestamps()
    })
}

exports.down = function down (knex) {
  return knex.schema
    .dropTable('tokens')
    .dropTable('users')
}
