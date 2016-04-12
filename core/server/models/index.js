/**
 * Dependencies
 */

var _ = require('lodash'),

    exports,
    models;

/**
 * Expose all models
 */

exports = module.exports;

models = [
    'accesstoken',
    'client-trusted-domain',
    'client',
    'permission',
    'refreshtoken',
    'role',
    'settings',
    'user'
];

function init() {
    exports.Base = require('./base');

    models.forEach(function (name) {
        _.extend(exports, require('./' + name));
    });
}

/**
 * Expose `init`
 */

exports.init = init;
