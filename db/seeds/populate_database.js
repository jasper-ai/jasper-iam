var timestamp = new Date()

exports.seed = function (knex) {
  return knex('tokens').del()
    .then(() => knex('users').del())
    .then(() =>
      knex('users').insert({
        email: 'godmode@jasperdoes.xyz',
        password: '$2a$10$jjIq7M0fq8VydM9sPH.UzuGOLQCxZTS.Ff0rGziW.8eVOaKs3ozxS',
        _roles: 'god-mode',
        created_at: timestamp,
        updated_at: timestamp
      })
    )
    .then(() =>
      knex('users').insert({
        email: 'admin@jasperdoes.xyz',
        password: '$2a$10$jjIq7M0fq8VydM9sPH.UzuGOLQCxZTS.Ff0rGziW.8eVOaKs3ozxS',
        _roles: 'iam-admin,data-admin,worker-user',
        created_at: timestamp,
        updated_at: timestamp
      })
    )
    .then(() =>
      knex('users').insert({
        email: 'jasper-api@jasperdoes.xyz',
        password: '$2a$10$jjIq7M0fq8VydM9sPH.UzuGOLQCxZTS.Ff0rGziW.8eVOaKs3ozxS',
        _roles: 'iam-user,data-user,worker-user',
        created_at: timestamp,
        updated_at: timestamp
      })
    )
    .then(() =>
      knex('users').insert({
        email: 'jasper-data@jasperdoes.xyz',
        password: '$2a$10$jjIq7M0fq8VydM9sPH.UzuGOLQCxZTS.Ff0rGziW.8eVOaKs3ozxS',
        _roles: 'iam-user',
        created_at: timestamp,
        updated_at: timestamp
      })
    )
    .then(() =>
      knex('users').insert({
        email: 'jasper-worker@jasperdoes.xyz',
        password: '$2a$10$jjIq7M0fq8VydM9sPH.UzuGOLQCxZTS.Ff0rGziW.8eVOaKs3ozxS',
        _roles: 'iam-user',
        created_at: timestamp,
        updated_at: timestamp
      })
    )
    .then(() =>
      knex('users').insert({
        email: 'jasper-cli@jasperdoes.xyz',
        password: '$2a$10$jjIq7M0fq8VydM9sPH.UzuGOLQCxZTS.Ff0rGziW.8eVOaKs3ozxS',
        _roles: 'iam-user,worker-user',
        created_at: timestamp,
        updated_at: timestamp
      })
    )
}
