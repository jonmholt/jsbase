var	errors          = require('../errors'),
    logger          = require('morgan'),
    path            = require('path'),
    routes          = require('../routes'),
    serveStatic     = require('express').static,
    slashes         = require('connect-slashes'),
    storage         = require('../storage'),
    passport        = require('passport'),
    authStrategies   = require('./auth-strategies'),
    busboy           = require('./app-busboy'),
    auth             = require('./auth'),
    cacheControl     = require('./cache-control'),
    checkSSL         = require('./check-ssl'),
    decideIsAdmin    = require('./decide-is-admin'),
    oauth            = require('./oauth'),
    redirectToSetup  = require('./redirect-to-setup'),
    serveSharedFile  = require('./serve-shared-file'),
    spamPrevention   = require('./spam-prevention'),
    uncapitalise     = require('./uncapitalise'),
	middleware,
    setupMiddleware;

middleware = {
    busboy: busboy,
    cacheControl: cacheControl,
    spamPrevention: spamPrevention,
    oauth: oauth,
    api: {
        authenticateClient: auth.authenticateClient,
        authenticateUser: auth.authenticateUser,
        requiresAuthorizedUser: auth.requiresAuthorizedUser,
        requiresAuthorizedUserPublicAPI: auth.requiresAuthorizedUserPublicAPI,
        errorHandler: errors.handleAPIError
    }
};

setupMiddleware = function setupMiddleware(mainApp, adminApp) {
};

module.exports = setupMiddleware;
// Export middleware functions directly
module.exports.middleware = middleware;