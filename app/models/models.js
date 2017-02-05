'use strict';

module.exports = function (modelHelpers, connection, mongoose, moment, uuid) {

    var User = require('./user')(modelHelpers, connection, mongoose);
    var UserAuthToken = require('./userAuthToken')(modelHelpers, connection, mongoose, moment, uuid, 30);
    var UserRole = require('./userRole')(modelHelpers, connection, mongoose);
    var News = require('./news')(modelHelpers, connection, mongoose, moment);

    var models = {
        user: User,
        userAuthToken: UserAuthToken,
        userRole: UserRole,
        news: News
    };

    return models;
};
