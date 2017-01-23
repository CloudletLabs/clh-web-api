module.exports = function (require, logger, models) {

    var userAuthToken = require('../controllers/userAuthToken')(logger, models);

    return {
        userAuthToken: userAuthToken
    };
};