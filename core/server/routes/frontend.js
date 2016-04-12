var frontend    = require('../controllers/frontend'),
    express     = require('express'),

    frontendRoutes;

frontendRoutes = function frontendRoutes(middleware) {
    var router = express.Router();

    // ### Admin routes
    router.get(/^\/(logout|signout)\/$/, function redirectToSignout(req, res) {
        utils.redirect301(res, subdir + '/admin/signout/');
    });
    router.get(/^\/signup\/$/, function redirectToSignup(req, res) {
        utils.redirect301(res, subdir + '/admin/signup/');
    });

    // redirect to /admin and let that do the authentication to prevent redirects to /admin//admin etc.
    router.get(/^\/((wp-admin|dashboard|signin|login)\/?)$/, function redirectToAdmin(req, res) {
        utils.redirect301(res, subdir + '/admin/');
    });

    // ** Put routes here **

    // Default
    router.get('*', frontend.single);

    return router;
};

module.exports = frontendRoutes;
