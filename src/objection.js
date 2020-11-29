const Knex = require('knex');
const { Model } = require('objection');

module.exports = (app) => {

    const { client, connection } = app.get('sqlite3');

    const knex = Knex({
        client,
        connection,
        useNullAsDefault: true,
    });

    Model.knex(knex);

    app.set('knex', knex);

};
