const { Model } = require('objection');

const RoleValues = ['member', 'admin'];

module.exports = class UserModel extends Model {

    static get tableName() {
        return 'users';
    }

    // Optional JSON schema. This is not the database schema! Nothing is generated
    // based on this. This is only used for validation. Whenever a model instance
    // is created it is checked against this schema. http://json-schema.org/.
    static get jsonSchema() {
        return {
            type: 'object',

            properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
                password: { type: 'string' },
                role: { type: 'string', enum: RoleValues },
            }
        };
    }

    // This object defines the relations to other models.
    static get relationMappings() {

        return {
            friends: {
                relation: Model.ManyToManyRelation,
                modelClass: UserModel,
                join: {
                    from: 'users.id',
                    // ManyToMany relation needs the `through` object to describe the join table.
                    through: {
                        from: 'connections.userId',
                        to: 'connections.friendId'
                    },
                    to: 'users.id'
                }
            },
        };
    }

}
