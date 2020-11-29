// This is the database adapter service class
const { Service } = require('feathers-objection');

module.exports = class Users extends Service {

    constructor(options, app) {

        const { Model, ...otherOptions } = options;

        super({
            ...otherOptions,
            model: Model,
        });

    }

};
