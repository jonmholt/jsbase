// # the app Server
// Handles the creation of an HTTP Server for the app
var Promise = require('bluebird'),
    chalk = require('chalk'),
    fs = require('fs'),
    errors = require('./errors'),
    config = require('./config'),
    i18n   = require('./i18n');

/**
 * ## AppServer
 * @constructor
 * @param {Object} rootApp - parent express instance
 */
function AppServer(rootApp) {
    this.rootApp = rootApp;
    this.httpServer = null;
    this.connections = {};
    this.connectionId = 0;

    // Expose config module for use externally.
    this.config = config;
}

/**
 * ## Public API methods
 *
 * ### Start
 * Starts the server listening on the configured port.
 * Alternatively you can pass in your own express instance and let the app
 * start listening for you.
 * @param  {Object} externalApp - Optional express app instance.
 * @return {Promise} Resolves once the app has started
 */
AppServer.prototype.start = function (externalApp) {
    var self = this,
        rootApp = externalApp ? externalApp : self.rootApp;

    return new Promise(function (resolve) {
        var socketConfig = config.getSocket();

        if (socketConfig) {
            // Make sure the socket is gone before trying to create another
            try {
                fs.unlinkSync(socketConfig.path);
            } catch (e) {
                // We can ignore this.
            }

            self.httpServer = rootApp.listen(socketConfig.path);

            fs.chmod(socketConfig.path, socketConfig.permissions);
        } else {
            self.httpServer = rootApp.listen(
                config.server.port,
                config.server.host
            );
        }

        self.httpServer.on('error', function (error) {
            if (error.errno === 'EADDRINUSE') {
                errors.logError(
                    i18n.t('errors.httpServer.addressInUse.error'),
                    i18n.t('errors.httpServer.addressInUse.context', {port: config.server.port}),
                    i18n.t('errors.httpServer.addressInUse.help')
                );
            } else {
                errors.logError(
                    i18n.t('errors.httpServer.otherError.error', {errorNumber: error.errno}),
                    i18n.t('errors.httpServer.otherError.context'),
                    i18n.t('errors.httpServer.otherError.help')
                );
            }
            process.exit(-1);
        });
        
        self.httpServer.on('connection', self.connection.bind(self));
        self.httpServer.on('listening', function () {
            self.logStartMessages();
            resolve(self);
        });
    });
};

/**
 * ### Stop
 * Returns a promise that will be fulfilled when the server stops. If the server has not been started,
 * the promise will be fulfilled immediately
 * @returns {Promise} Resolves once the app has stopped
 */
AppServer.prototype.stop = function () {
    var self = this;

    return new Promise(function (resolve) {
        if (self.httpServer === null) {
            resolve(self);
        } else {
            self.httpServer.close(function () {
                self.httpServer = null;
                self.logShutdownMessages();
                resolve(self);
            });

            self.closeConnections();
        }
    });
};

/**
 * ### Restart
 * Restarts the application
 * @returns {Promise} Resolves once the app has restarted
 */
AppServer.prototype.restart = function () {
    return this.stop().then(this.start.bind(this));
};

/**
 * ## Private (internal) methods
 *
 * ### Connection
 * @param {Object} socket
 */
AppServer.prototype.connection = function (socket) {
    var self = this;

    self.connectionId += 1;
    socket._appId = self.connectionId;

    socket.on('close', function () {
        delete self.connections[this._appId];
    });

    self.connections[socket._appId] = socket;
};

/**
 * ### Close Connections
 * Most browsers keep a persistent connection open to the server, which prevents the close callback of
 * httpServer from returning. We need to destroy all connections manually.
 */
AppServer.prototype.closeConnections = function () {
    var self = this;

    Object.keys(self.connections).forEach(function (socketId) {
        var socket = self.connections[socketId];

        if (socket) {
            socket.destroy();
        }
    });
};

/**
 * ### Log Start Messages
 */
AppServer.prototype.logStartMessages = function () {
    // Startup & Shutdown messages
    if (process.env.NODE_ENV === 'production') {
        console.log(
            chalk.green(i18n.t('notices.httpServer.appIsRunningIn', {env: process.env.NODE_ENV})),
            i18n.t('notices.httpServer.yourBlogIsAvailableOn', {url: config.url}),
            chalk.gray(i18n.t('notices.httpServer.ctrlCToShutDown'))
        );
    } else {
        console.log(
            chalk.green(i18n.t('notices.httpServer.appIsRunningIn', {env: process.env.NODE_ENV})),
            i18n.t('notices.httpServer.listeningOn'),
            config.getSocket() || config.server.host + ':' + config.server.port,
            i18n.t('notices.httpServer.urlConfiguredAs', {url: config.url}),
            chalk.gray(i18n.t('notices.httpServer.ctrlCToShutDown'))
        );
    }

    function shutdown() {
        console.log(chalk.red(i18n.t('notices.httpServer.appHasShutdown')));
        if (process.env.NODE_ENV === 'production') {
            console.log(
                i18n.t('notices.httpServer.yourBlogIsNowOffline')
            );
        } else {
            console.log(
                i18n.t('notices.httpServer.appWasRunningFor'),
                Math.round(process.uptime()),
                i18n.t('common.time.seconds')
            );
        }
        process.exit(0);
    }
    // ensure that the app exits correctly on Ctrl+C and SIGTERM
    process.
        removeAllListeners('SIGINT').on('SIGINT', shutdown).
        removeAllListeners('SIGTERM').on('SIGTERM', shutdown);
};

/**
 * ### Log Shutdown Messages
 */
AppServer.prototype.logShutdownMessages = function () {
    console.log(chalk.red(i18n.t('notices.httpServer.appIsClosingConnections')));
};

module.exports = AppServer;
