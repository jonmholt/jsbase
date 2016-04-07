/ # Task automation for Ghost
//
// Run various tasks when developing for and working with your project.
//
// **Usage instructions:** can be found in the [Custom Tasks](#custom%20tasks) section or by running `grunt --help`.
//
// **Debug tip:** If you have any problems with any Grunt tasks, try running them with the `--verbose` command


var escapeChar     = process.platform.match(/^win/) ? '^' : '\\',
    cwd            = process.cwd().replace(/( |\(|\))/g, escapeChar + '$1'),
    buildDirectory = path.resolve(cwd, '.build'),
    distDirectory  = path.resolve(cwd, '.dist'),
    mochaPath      = path.resolve(cwd + '/node_modules/grunt-mocha-cli/node_modules/mocha/bin/mocha'),
    emberPath      = path.resolve(cwd + '/core/client/node_modules/.bin/ember'),
//     _              = require('lodash'),
//     chalk          = require('chalk'),
//     fs             = require('fs-extra'),
//     https          = require('https'),
//     moment         = require('moment'),
//     getTopContribs = require('top-gh-contribs'),
//     path           = require('path'),
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
            // ### grunt-shell
            // Command line tools where it's easier to run a command directly than configure a grunt plugin
            shell: {
                ember: {
                    command: function (mode) {
                        switch (mode) {
                            case 'init':
                                return 'echo Installing client dependencies... && npm install';

                            case 'prod':
                                return emberPath + ' build --environment=production --silent';

                            case 'dev':
                                return emberPath + ' build';

                            case 'test':
                                return emberPath + ' test --silent';
                        }
                    },
                    options: {
                        execOptions: {
                            cwd: path.resolve(process.cwd() + '/core/client/'),
                            stdout: false
                        }
                    }
                },
                // #### Run bower install
                // Used as part of `grunt init`. See the section on [Building Assets](#building%20assets) for more
                // information.
                bower: {
                    command: path.resolve(cwd + '/node_modules/.bin/bower --allow-root install'),
                    options: {
                        stdout: true,
                        stdin: false
                    }
                },

                test: {
                    command: function (test) {
                        return 'node ' + mochaPath  + ' --timeout=15000 --ui=bdd --reporter=spec --colors core/test/' + test;
                    }
                },

                shrinkwrap: {
                    command: 'npm shrinkwrap'
                },

                dedupe: {
                    command: 'npm dedupe'
                },

                csscombfix: {
                    command: path.resolve(cwd + '/node_modules/.bin/csscomb -c core/client/app/styles/csscomb.json -v core/client/app/styles')
                },

                csscomblint: {
                    command: path.resolve(cwd + '/node_modules/.bin/csscomb -c core/client/app/styles/csscomb.json -lv core/client/app/styles')
                }
            },
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

        };

        // Load the configuration
        grunt.initConfig(cfg);

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
            ['init']);
        
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
            ['shell:ember:init', 'shell:bower', 'update_submodules', 'assets', 'default']);

        // ### Basic Asset Building
        // Builds and moves necessary client assets. Prod additionally builds the ember app.
        grunt.registerTask('assets', 'Basic asset building & moving',
            //['clean:tmp', 'buildAboutPage']);
            ['clean:tmp']);

        // ### Default asset build
        // `grunt` - default grunt task
        //
        // Build assets and dev version of the admin app.
        grunt.registerTask('default', 'Build JS & templates for development',
            ['shell:ember:dev']);
    };

module.exports = configureGrunt;
