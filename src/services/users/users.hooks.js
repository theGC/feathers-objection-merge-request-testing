const { authenticate } = require('@feathersjs/authentication').hooks;

const {
    hashPassword, protect
} = require('@feathersjs/authentication-local').hooks;

function noExternalModifyRole () {

    return (context) => {

        // internal request
        if (!context.params.provider) return context;

        if (context.data && context.data.role) {

            delete context.data.role;

        }

        return context;

    };

}

module.exports = {
    before: {
        all: [],
        find: [ authenticate('jwt') ],
        get: [ authenticate('jwt') ],
        create: [
            hashPassword('password'),
            noExternalModifyRole(),
        ],
        update: [
            hashPassword('password'),
            authenticate('jwt'),
            noExternalModifyRole(),
        ],
        patch: [
            hashPassword('password'),
            authenticate('jwt'),
            noExternalModifyRole(),
        ],
        remove: [ authenticate('jwt') ]
    },

    after: {
        all: [
            // Make sure the password field is never sent to the client
            // Always must be the last hook
            protect('password')
        ],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};
