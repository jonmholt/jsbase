//# Task automation for Ghost
//
// Run various tasks when developing for and working with your project.
//
// **Usage instructions:** can be found in the [Custom Tasks](#custom%20tasks) section or by running `grunt --help`.
//
// **Debug tip:** If you have any problems with any Grunt tasks, try running them with the `--verbose` command


var escapeChar     = process.platform.match(/^win/) ? '^' : '\\',
    cwd            = process.cwd().replace(/( |\(|\))/g, escapeChar + '$1'),
    path           = require('path'),
    buildDirectory = path.resolve(cwd, '.build'),
    distDirectory  = path.resolve(cwd, '.dist'),
    mochaPath      = path.resolve(cwd + '/node_modules/grunt-mocha-cli/node_modules/mocha/bin/mocha'),
    emberPath      = path.resolve(cwd + '/core/client/node_modules/.bin/ember'),
    chalk          = require('chalk'),
//     _              = require('lodash'),
//     fs             = require('fs-extra'),
//     https          = require('https'),
//     moment         = require('moment'),
//     getTopContribs = require('top-gh-contribs'),
//     Promise        = require('bluebird'),

    // ## Grunt configuration

    configureGrunt = function (grunt) {
        // Find all of the task which start with `grunt-` and load them, rather than explicitly declaring them all
        require('matchdep').filterDev(['grunt-*', '!grunt-cli']).forEach(grunt.loadNpmTasks);

        var cfg = {
            // #### Common paths used by tasks
            paths: {
                build: buildDirectory,
                releaseBuild: path.join(buildDirectory, 'release'),
                dist: distDirectory,
                releaseDist: path.join(distDirectory, 'release')
            },
            // Standard build type, for when we have nightlies again.
            buildType: 'Build',
            // Load package.json so that we can create correctly versioned releases.
            pkg: grunt.file.readJSON('package.json'),
            

            // ### grunt-contrib-clean
            // Clean up files as part of other tasks
            clean: {
                built: {
                    src: [
                        'core/built/**',
                        'core/client/dist/**',
                        'core/client/public/assets/img/contributors/**',
                        'core/client/app/templates/-contributors.hbs'
                    ]
                },
                release: {
                    src: ['<%= paths.releaseBuild %>/**']
                },
                test: {
                    src: ['content/data/ghost-test.db']
                },
                tmp: {
                    src: ['.tmp/**']
                },
                dependencies: {
                    src: ['node_modules/**', 'core/client/bower_components/**', 'core/client/node_modules/**']
                }
            },
            // ### grunt-update-submodules
            // Grunt task to update git submodules
            update_submodules: {
                default: {
                    options: {
                        params: '--init'
                    }
                }
            },
            
            // ### grunt-mocha-cli
            // Configuration for the mocha test runner, used to run unit, integration and route tests as part of
            // `grunt validate`. See [grunt validate](#validate) and its sub tasks for more information.
            mochacli: {
                options: {
                    ui: 'bdd',
                    reporter: grunt.option('reporter') || 'spec',
                    timeout: '15000',
                    save: grunt.option('reporter-output')
                },
                // #### All Route tests
                routes: {
                    src: [
                        'core/test/functional/routes/**/*_spec.js'
                    ]
                },

            },

            // ### grunt-contrib-watch
            // Watch files and livereload in the browser during development.
            // See the [grunt dev](#live%20reload) task for how this is used.
            watch: {
                livereload: {
                    files: [
                        'core/built/assets/*.js',
                    ],
                    options: {
                        livereload: true
                    }
                },
                express: {
                    files:  ['core/server/**/*.js'],
                    tasks:  ['express:dev'],
                    options: {
                        spawn: false
                    }
                }
            },
            // ### grunt-express-server
            // Start a Ghost expess server for use in development and testing
            express: {
                options: {
                    script: 'index.js',
                    output: 'App is running'
                },

                dev: {
                    options: {}
                },
                test: {
                    options: {
                        node_env: 'testing'
                    }
                }
            },
        };

        // Load the configuration
        grunt.initConfig(cfg);

        // ## Testing

        // We have an extensive set of test suites. The following section documents the various types of tests
        // and how to run them.
        //
        // TLDR; run `grunt validate`

        // #### Set Test Env *(Utility Task)*
        // Set the NODE_ENV to 'testing' 
        // This ensures that the tests get run under the correct environment, using the correct database, and
        // that they work as expected. Trying to run tests with no ENV set will throw an error to do with `client`.
        grunt.registerTask('set-test-env',
            'Use "testing" Ghost config; unless we are running on travis (then show queries for debugging)',
            function () {
                process.env.NODE_ENV = 'testing';
                //cfg.express.test.options.node_env = process.env.NODE_ENV;
            });

        // #### Ensure Config *(Utility Task)*
        // Make sure that we have a `config.js` file when running tests
        // We require a `config.js` file to specify the database settings etc. This project comes with an example file:
        // `config.example.js` which is copied and renamed to `config.js` by the bootstrap process
        grunt.registerTask('ensure-config', function () {
            var config = require('./core/server/config'),
                done = this.async();

            if (!process.env.TEST_SUITE || process.env.TEST_SUITE !== 'client') {
                config.load().then(function () {
                    done();
                }).catch(function (err) {
                    grunt.fail.fatal(err.stack);
                });
            } else {
                done();
            }
        });

        // ### Test-All
        // **Main testing task**
        //
        // `grunt test-all` will lint and test your pre-built local Ghost codebase.
        //
        // `grunt test-all` runs all 6 test suites. See the individual sub tasks below for
        // details of each of the test suites.
        //
        grunt.registerTask('test-all', 'Run tests for both server and client',
            ['test-server']);//, 'test-client']);

        grunt.registerTask('test-server', 'Run server tests',
            ['test-routes']);//, 'test-module', 'test-unit', 'test-integration']);

        // grunt.registerTask('test-client', 'Run client tests',
        //     ['test-ember']);

        // ### Route tests *(sub task)*
        // `grunt test-routes` will run just the route tests
        //
        // If you need to run an individual route test file, you can do so, providing you have a `config.js` file and
        // mocha installed globally by using a command in the form:
        //
        // `NODE_ENV=testing mocha --timeout=15000 --ui=bdd --reporter=spec core/test/functional/routes/admin_spec.js`
        //
        // Route tests are run with [mocha](http://mochajs.org/) using
        // [should](https://github.com/visionmedia/should.js) and [supertest](https://github.com/visionmedia/supertest)
        // to describe and create the tests.
        //
        // Supertest enables us to describe requests that we want to make, and also describe the response we expect to
        // receive back. It works directly with express, so we don't have to run a server to run the tests.
        //
        // The purpose of the route tests is to ensure that all of the routes (pages, and API requests) in Ghost
        // are working as expected, including checking the headers and status codes received. It is very easy and
        // quick to test many permutations of routes / urls in the system.
        grunt.registerTask('test-routes', 'Run functional route tests (mocha)',
            ['test-setup', 'mochacli:routes']
        );

        // ### test-setup *(utility)(
        // `grunt test-setup` will run all the setup tasks required for running tests
        grunt.registerTask('test-setup', 'Setup ready to run tests',
            ['clean:test', 'set-test-env', 'ensure-config']
        );

        

        // ### Validate
        // **Main testing task**
        //
        // `grunt validate` will build, lint and test your local codebase.
        //
        // `grunt validate` is one of the most important and useful grunt tasks that we have available to use. It
        // manages the build of your environment and then calls `grunt test`
        //
        // `grunt validate` is called by `npm test` and is used by Travis.
        grunt.registerTask('validate', 'Run tests and lint code', function () {
            // if (process.env.TEST_SUITE === 'server') {
            //     grunt.task.run(['init', 'test-server']);
            // } else if (process.env.TEST_SUITE === 'client') {
            //     grunt.task.run(['init', 'test-client']);
            // } else if (process.env.TEST_SUITE === 'lint') {
            //     grunt.task.run(['shell:ember:init', 'shell:bower', 'lint']);
            // } else {
                grunt.task.run(['validate-all']);
            // }
        });

        grunt.registerTask('validate-all', 'Lint code and run all tests',
            // ['init', 'lint', 'test-all']);
            ['init','test-all']);
        
        // ## Building assets
        //
        // ### Init assets
        // `grunt init` - will run an initial asset build for you
        //
        // Grunt init runs `bower install` as well as the standard asset build tasks which occur when you run just
        // `grunt`. This fetches the latest client side dependencies, and moves them into their proper homes.
        //
        // This task is very important, and should always be run when fetching down an updated code base just after
        // running `npm install`.
        //
        // `bower` does have some quirks, such as not running as root. If you have problems please try running
        // `grunt init --verbose` to see if there are any errors.
        grunt.registerTask('init', 'Prepare the project for development',
            //['shell:ember:init', 'shell:bower', 'update_submodules', 'assets', 'default']);
            ['assets','default']);

        // ### Clean Basic Asset
        // Start with a clean slate
        grunt.registerTask('assets', 'Basic asset building & moving',
            //['clean:tmp', 'buildAboutPage']);
            ['clean:tmp']);

        // ### Live reload
        // `grunt dev` - build assets on the fly whilst developing

        // `grunt dev` manages starting an express server and restarting the server whenever core files change (which
        // require a server restart for the changes to take effect) and also manage reloading the browser whenever
        // frontend code changes.
        grunt.registerTask('dev', 'Dev Mode; watch files and restart server on changes',
           //['bgShell:ember', 'express:dev', 'watch']);
           ['express:dev', 'watch']);

        // ### Default asset build
        // `grunt` - default grunt task
        //
        // Build assets and dev version of the admin app.
        grunt.registerTask('default', 'Build JS & templates for development',function(){
            console.log(chalk.yellow('Default does nothing at the moment.'));
        });
    };

module.exports = configureGrunt;
