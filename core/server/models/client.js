var appBookshelf = require('./base'),
    crypto         = require('crypto'),
    uuid           = require('node-uuid'),

    Client,
    Clients;

Client = appBookshelf.Model.extend({

    tableName: 'clients',

    defaults: function defaults() {
        var env = process.env.NODE_ENV,
            secret = env.indexOf('testing') !== 0 ? crypto.randomBytes(6).toString('hex') : 'not_available';

        return {
            uuid: uuid.v4(),
            secret: secret,
            status: 'development',
            type: 'ua'
        };
    },

    trustedDomains: function trustedDomains() {
        return this.hasMany('ClientTrustedDomain', 'client_id');
    }
}, {
    /**
    * Returns an array of keys permitted in a method's `options` hash, depending on the current method.
    * @param {String} methodName The name of the method to check valid options for.
    * @return {Array} Keys allowed in the `options` hash of the model's method.
    */
    permittedOptions: function permittedOptions(methodName) {
        var options = appBookshelf.Model.permittedOptions(),

            // whitelists for the `options` hash argument on methods, by method name.
            // these are the only options that can be passed to Bookshelf / Knex.
            validOptions = {
                findOne: ['withRelated']
            };

        if (validOptions[methodName]) {
            options = options.concat(validOptions[methodName]);
        }

        return options;
    }
});

Clients = appBookshelf.Collection.extend({
    model: Client
});

module.exports = {
    Client: appBookshelf.model('Client', Client),
    Clients: appBookshelf.collection('Clients', Clients)
};
