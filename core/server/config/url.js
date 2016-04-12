// Contains all path information to be used throughout
// the codebase.

var appConfig = '',
    // @TODO: unify this with routes.apiBaseUrl
    apiPath = '/admin/api/v0.1';

// ## setConfig
// Simple utility function to allow
// passing of the appConfig
// object here to be used locally
// to ensure clean dependency graph
// (i.e. no circular dependencies).
function setConfig(config) {
    appConfig = config;
}

function getBaseUrl(secure) {
    if (secure && appConfig.urlSSL) {
        return appConfig.urlSSL;
    } else {
        if (secure) {
            return appConfig.url.replace('http://', 'https://');
        } else {
            return appConfig.url;
        }
    }
}

function urlJoin() {
    var args = Array.prototype.slice.call(arguments),
        prefixDoubleSlash = false,
        subdir = appConfig.paths.subdir.replace(/\//g, ''),
        subdirRegex,
        url;

    // Remove empty item at the beginning
    if (args[0] === '') {
        args.shift();
    }

    // Handle schemeless protocols
    if (args[0].indexOf('//') === 0) {
        prefixDoubleSlash = true;
    }

    // join the elements using a slash
    url = args.join('/');

    // Fix multiple slashes
    url = url.replace(/(^|[^:])\/\/+/g, '$1/');

    // Put the double slash back at the beginning if this was a schemeless protocol
    if (prefixDoubleSlash) {
        url = url.replace(/^\//, '//');
    }

    // Deduplicate subdirectory
    if (subdir) {
        subdirRegex = new RegExp(subdir + '\/' + subdir + '\/');
        url = url.replace(subdirRegex, subdir + '/');
    }

    return url;
}

// ## createUrl
// Simple url creation from a given path
// Ensures that our urls contain the subdirectory if there is one
// And are correctly formatted as either relative or absolute
// Usage:
// createUrl('/', true) -> http://my-app.com/
// E.g. /app/ subdir
// createUrl('/welcome-to-my-app/') -> /app/welcome-to-my-app/
// Parameters:
// - urlPath - string which must start and end with a slash
// - absolute (optional, default:false) - boolean whether or not the url should be absolute
// - secure (optional, default:false) - boolean whether or not to use urlSSL or url config
// Returns:
//  - a URL which always ends with a slash
function createUrl(urlPath, absolute, secure) {
    urlPath = urlPath || '/';
    absolute = absolute || false;
    var base;

    // create base of url, always ends without a slash
    if (absolute) {
        base = getBaseUrl(secure);
    } else {
        base = appConfig.paths.subdir;
    }

    return urlJoin(base, urlPath);
}

function apiUrl() {
    var url;

    if (appConfig.forceAdminSSL) {
        url = (appConfig.urlSSL || appConfig.url).replace(/^.*?:\/\//g, 'https://');
    } else if (appConfig.urlSSL) {
        url = appConfig.urlSSL.replace(/^.*?:\/\//g, 'https://');
    } else if (appConfig.url.match(/^https:/)) {
        url = appConfig.url;
    } else {
        url = appConfig.url.replace(/^.*?:\/\//g, '//');
    }

    return url.replace(/\/$/, '') + apiPath + '/';
}

module.exports.setConfig = setConfig;
module.exports.urlJoin = urlJoin;
module.exports.apiUrl = apiUrl;
module.exports.getBaseUrl = getBaseUrl;
