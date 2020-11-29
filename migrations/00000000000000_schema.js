const RoleValues = ['member', 'admin'];

exports.up = async (knex) => {

    await knex.schema.createTable('users', table => {

        table.increments('id').primary();
        table.string('name');
        table.string('email');
        table.string('password');
        table.enu('role', RoleValues, {
            useNative: true,
            enumName: 'role_type',
        }).defaultTo('member');

    });

    await knex.schema.createTable('connections', table => {

        table.increments('id').primary();

        table.integer('userId').notNullable()
            .references('id')
            .inTable('users');

        table.integer('friendId').notNullable()
            .references('id')
            .inTable('users');

    });

};

exports.down = async (knex) => {

    await knex.schema.dropTableIfExists('users');

    await knex.schema.dropTableIfExists('connections');

};