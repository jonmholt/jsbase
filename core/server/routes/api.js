var express     = require('express'),
    api         = require('../api'),
    apiRoutes;

apiRoutes = function apiRoutes(middleware) {
    var router = express.Router(),
        // Authentication for public endpoints
        authenticatePublic = [
            middleware.api.authenticateClient,
            middleware.api.authenticateUser,
            middleware.api.requiresAuthorizedUserPublicAPI
        ],
        // Require user for private endpoints
        authenticatePrivate = [
            middleware.api.authenticateClient,
            middleware.api.authenticateUser,
            middleware.api.requiresAuthorizedUser
        ];

    // alias delete with del
    router.del = router.delete;

    // ** Put routes here **

    // API Router middleware
    router.use(middleware.api.errorHandler);

    return router;
};

module.exports = apiRoutes;
