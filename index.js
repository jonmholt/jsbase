// # Startup
// Orchestrates the startup when run from command line.
var express,
    app,
    parentApp,
    errors;

// Make sure dependencies are installed and file system permissions are correct.
require('./core/server/utils/startup-check').check();

// Proceed with startup
express = require('express');
app = require('./core');
errors = require('./core/server/errors');

// Create our parent express app instance.
parentApp = express();

// Call the app to get an instance of AppServer
app().then(function (appServer) {
    // Mount our Ghost instance on our desired subdirectory path if it exists.
    parentApp.use(appServer.config.paths.subdir, appServer.rootApp);

    // Let Ghost handle starting our server instance.
    appServer.start(parentApp);
}).catch(function (err) {
    errors.logErrorAndExit(err, err.context, err.help);
});
