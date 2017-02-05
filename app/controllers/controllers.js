'use strict';

module.exports = function (logger, models, controllerHelpers) {

    var userAuthToken = require('./userAuthToken')(logger, models, controllerHelpers);
    var user = require('./user')(logger, models, controllerHelpers);
    var news = require('./news')(logger, models, controllerHelpers);

    return {
        userAuthToken: userAuthToken,
        user: user,
        news: news
    };
};