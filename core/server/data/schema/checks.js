function isUser(jsonData) {
    return jsonData.hasOwnProperty('bio') && jsonData.hasOwnProperty('website') &&
        jsonData.hasOwnProperty('status') && jsonData.hasOwnProperty('location');
}

function isNav(jsonData) {
    return jsonData.hasOwnProperty('label') && jsonData.hasOwnProperty('url') &&
        jsonData.hasOwnProperty('slug') && jsonData.hasOwnProperty('current');
}

module.exports = {
    isUser: isUser,
    isNav: isNav
};
