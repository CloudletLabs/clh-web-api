module.exports = function (require, logger, models, controllerHelpers) {

    var userAuthToken = require('../app/controllers/userAuthToken')(logger, models, controllerHelpers);
    var user = require('../app/controllers/user')(logger, models, controllerHelpers);
    var news = require('../app/controllers/news')(logger, models, controllerHelpers);

    return {
        userAuthToken: userAuthToken,
        user: user,
        news: news
    };
};