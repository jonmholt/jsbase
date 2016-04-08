/**
 * Dependencies
 */

var Promise = require('bluebird'),
    fs = require('fs'),
    //i18n = require('../i18n'),

    readFile = Promise.promisify(fs.readFile);

/**
 * Parse package.json and validate it has
 * all the required fields
 */

function parsePackageJson(path) {
    return readFile(path)
        .catch(function () {
            var err = new Error('Could not read package.json file');
            err.context = path;

            return Promise.reject(err);
        })
        .then(function (source) {
            var hasRequiredKeys, json, err;

            try {
                json = JSON.parse(source);

                hasRequiredKeys = json.name && json.version;

                if (!hasRequiredKeys) {
                    err = new Error('\"name\" or \"version\" is missing from theme package.json file.');
                    err.context = path;
                    err.help = 'This will be required in future.';

                    return Promise.reject(err);
                }

                return json;
            } catch (parseError) {
                err = new Error('Something bad happened: '+parseError);
                err.context = path;
                err.help = 'You\'ll want to fix that.';

                return Promise.reject(err);
            }
        });
}

/**
 * Expose `parsePackageJson`
 */

module.exports = parsePackageJson;
