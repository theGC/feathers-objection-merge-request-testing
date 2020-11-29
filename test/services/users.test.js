const assert = require('assert');
const faker = require('faker')

const app = require('../../src/app');

describe('\'users\' service', () => {

    it('registered the service', () => {

        const service = app.service('users');

        assert.ok(service, 'Registered the service');

    });


    it('creates a user and encrypts password', async () => {

        const user = await app.service('users').create({
            password: 'secret',
        });

        // Makes sure the password got encrypted
        assert.ok(user.password !== 'secret');

    });


    it('prevents role updates on patch', async () => {

        const userData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'member',
        };

        const user = await app.service('users').create(userData);

        const auth = await app.service('authentication').create({
            strategy: 'local',
            ...userData
        });

        const patchedUser = await app.service('users').patch(user.id, {
            role: 'admin',
        }, {
            provider: 'rest',
            authentication: {
                strategy: 'jwt',
                accessToken: auth.accessToken,
            },
        });

        assert.ok(patchedUser.role !== 'admin');

    });


    it('can not create new admin users via external request', async () => {

        const userOneData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'admin',
        };

        const user = await app.service('users').create(userOneData, {
            provider: 'rest',
        });

        assert.ok(user.role !== 'admin');

    });


    it('can not graph insert / upsert new users via service patch', async () => {

        const userOneData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'member',
        };

        const userTwoData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'admin',
        };

        const userThreeData = {
            id: faker.random.number(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'admin',
        };

        const userOne = await app.service('users').create(userOneData);

        const auth = await app.service('authentication').create({
            strategy: 'local',
            ...userOneData
        });

        await app.service('users').patch(userOne.id, {
            friends: [userTwoData, userThreeData],
        }, {
            provider: 'rest',
            authentication: {
                strategy: 'jwt',
                accessToken: auth.accessToken,
            },
        });

        const gotUserOne = await app.service('users').get(userOne.id, {
            query: {
                $eager: 'friends',
            },
        });

        assert.ok(gotUserOne.friends.length === 0);

    });


    it('[dangerous] can use mergeAllowInsert to create admin users via external create', async () => {

        const userTwoData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'admin',
        };

        const userOneData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'member',
            friends: [userTwoData],
        };

        const userOne = await app.service('users').create(userOneData, {
            provider: 'rest',
            mergeAllowInsert: 'friends',
        });

        const gotUserOne = await app.service('users').get(userOne.id, {
            query: {
                $eager: 'friends',
            },
        });

        assert.ok(gotUserOne.friends.length === 1);

        assert.ok(gotUserOne.friends[0].role === 'admin');

    });


    it('[dangerous] can use mergeAllowUpsert to create admin users via external patch', async () => {

        const userOneData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'member',
        };

        const userTwoData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'admin',
        };

        const userOne = await app.service('users').create(userOneData);

        const auth = await app.service('authentication').create({
            strategy: 'local',
            ...userOneData
        });

        await app.service('users').patch(userOne.id, {
            friends: [userTwoData],
        }, {
            provider: 'rest',
            authentication: {
                strategy: 'jwt',
                accessToken: auth.accessToken,
            },
            mergeAllowUpsert: 'friends',
        });

        const gotUserOne = await app.service('users').get(userOne.id, {
            query: {
                $eager: 'friends',
            },
        });

        assert.ok(gotUserOne.friends.length === 1);

        assert.ok(gotUserOne.friends[0].role === 'admin');

    });


    it('[dangerous] can use mergeAllowUpsert to patch existing users to admin role', async () => {

        const userOneData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'member',
        };

        const userTwoData = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'member',
        };

        const userOne = await app.service('users').create(userOneData);

        const auth = await app.service('authentication').create({
            strategy: 'local',
            ...userOneData
        });

        // connect the users as friends
        await app.service('users').patch(userOne.id, {
            friends: [userTwoData],
        }, {
            provider: 'rest',
            authentication: {
                strategy: 'jwt',
                accessToken: auth.accessToken,
            },
            mergeAllowUpsert: 'friends',
        });

        // grab user ones friends
        const gotUserOne = await app.service('users').get(userOne.id, {
            query: {
                $eager: 'friends',
            },
        });

        assert.ok(gotUserOne.friends.length === 1);

        assert.ok(gotUserOne.friends[0].role !== 'admin');

        const userTwoId = gotUserOne.friends[0].id

        // run another patch to update user twos role
        await app.service('users').patch(userOne.id, {
            friends: [{
                id: userTwoId,
                role: 'admin',
            }],
        }, {
            provider: 'rest',
            authentication: {
                strategy: 'jwt',
                accessToken: auth.accessToken,
            },
            mergeAllowUpsert: 'friends',
        });

        const gotUserOneAgain = await app.service('users').get(userOne.id, {
            query: {
                $eager: 'friends',
            },
        });

        assert.ok(gotUserOneAgain.friends.length === 1);

        assert.ok(gotUserOneAgain.friends[0].role === 'admin');

    });

});
