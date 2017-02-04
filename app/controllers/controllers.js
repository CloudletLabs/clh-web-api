module.exports = function (require, logger, models, modelHelpers) {

    var userAuthToken = require('../app/controllers/userAuthToken')(logger, models, modelHelpers);
    var user = require('../app/controllers/user')(logger, models, modelHelpers);
    var news = require('../app/controllers/news')(logger, models, modelHelpers);

    return {
        userAuthToken: userAuthToken,
        user: user,
        news: news
    };
};