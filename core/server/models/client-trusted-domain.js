var appBookshelf = require('./base'),

    ClientTrustedDomain,
    ClientTrustedDomains;

ClientTrustedDomain = appBookshelf.Model.extend({
    tableName: 'client_trusted_domains'
});

ClientTrustedDomains = appBookshelf.Collection.extend({
    model: ClientTrustedDomain
});

module.exports = {
    ClientTrustedDomain: appBookshelf.model('ClientTrustedDomain', ClientTrustedDomain),
    ClientTrustedDomains: appBookshelf.collection('ClientTrustedDomains', ClientTrustedDomains)
};
