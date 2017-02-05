'use strict';

module.exports = function (logger, models, controllerHelpers) {

    let userAuthToken = require('./userAuthToken')(logger, models, controllerHelpers);
    let user = require('./user')(logger, models, controllerHelpers);
    let news = require('./news')(logger, models, controllerHelpers);

    return {
        userAuthToken: userAuthToken,
        user: user,
        news: news
    };
};