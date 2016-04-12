var	
	coreHelpers = {};

// Add helpers as properties of coreHelpers
registerHelpers = function (adminHbs) {
	// Expose hbs instance for admin
    coreHelpers.adminHbs = adminHbs;
    
};

module.exports = coreHelpers;
module.exports.loadCoreHelpers = registerHelpers;