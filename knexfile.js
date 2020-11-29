module.exports = {

    client: 'sqlite3',

    connection: './db.sqlite',

    pool: {
        min: 2,
        max: 10,
    },

    migrations: {
        tableName: 'knex_migrations',
        directory: './migrations',
        extension: 'js',
    },

};
