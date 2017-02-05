'use strict';

module.exports = function (modelHelpers, connection, mongoose, moment, uuid) {

    let User = require('./user')(modelHelpers, connection, mongoose);
    let UserAuthToken = require('./userAuthToken')(modelHelpers, connection, mongoose, moment, uuid, 30);
    let UserRole = require('./userRole')(modelHelpers, connection, mongoose);
    let News = require('./news')(modelHelpers, connection, mongoose, moment);

    return {
        user: User,
        userAuthToken: UserAuthToken,
        userRole: UserRole,
        news: News
    };
};
