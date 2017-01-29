module.exports = function (require, logger, models) {

    var userAuthToken = require('../app/controllers/userAuthToken')(logger, models);
    var user = require('../app/controllers/user')(logger, models);
    var news = require('../app/controllers/news')(logger, models);

    return {
        userAuthToken: userAuthToken,
        user: user,
        news: news
    };
};