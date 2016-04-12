// # App Configuration
// Setup your install for various environments

// Apps should run in `development` mode by default. 

var path = require('path'),
    config;

config = {
    // ### Production
    // When running your app in the wild, use the production environment.
    // Configure your URL and mail settings here
    production: {
        url: 'http://my-app.com',
        mail: {},
        database: {
            client: 'sqlite3',
            connection: {
                filename: path.join(__dirname, '/content/data/app.db')
            },
            debug: false
        },

        server: {
            host: '127.0.0.1',
            port: '2520'
        }
    },

    // ### Development **(default)**
    development: {
        // The url to use when providing links to the site, E.g. in RSS and email.
        url: 'http://localhost:2520',

        // Example mail config
        // ```
        //  mail: {
        //      transport: 'SMTP',
        //      options: {
        //          service: 'Mailgun',
        //          auth: {
        //              user: '', // mailgun username
        //              pass: ''  // mailgun password
        //          }
        //      }
        //  },
        // ```

        // #### Database
        database: {
            client: 'sqlite3',
            connection: {
                filename: path.join(__dirname, '/content/data/app-dev.db')
            },
            debug: false
        },
        // #### Server
        // Can be host & port (default), or socket
        server: {
            // Host to be passed to node's `net.Server#listen()`
            host: '127.0.0.1',
            // Port to be passed to node's `net.Server#listen()`, for iisnode set this to `process.env.PORT`
            port: '2520'
        },
        // #### Paths
        // Specify where your content directory lives
        paths: {
            contentPath: path.join(__dirname, '/content/')
        }
    },

    // ### Testing
    // Used when developing your app to run tests and check it's health
    // Uses a different port number
    testing: {
        url: 'http://127.0.0.1:2521',
        database: {
            client: 'sqlite3',
            connection: {
                filename: path.join(__dirname, '/content/data/app-test.db')
            },
            pool: {
                afterCreate: function (conn, done) {
                    conn.run('PRAGMA synchronous=OFF;' +
                    'PRAGMA journal_mode=MEMORY;' +
                    'PRAGMA locking_mode=EXCLUSIVE;' +
                    'BEGIN EXCLUSIVE; COMMIT;', done);
                }
            }
        },
        server: {
            host: '127.0.0.1',
            port: '2521'
        },
        logging: false
    },
};

module.exports = config;
