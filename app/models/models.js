module.exports = function (require, modelHelpers, connection, mongoose, moment, uuid) {

    var User = require('../app/models/user')(modelHelpers, connection, mongoose);
    var UserAuthToken = require('../app/models/userAuthToken')(modelHelpers, connection, mongoose, moment, uuid, 30);
    var UserRole = require('../app/models/userRole')(modelHelpers, connection, mongoose);
    var News = require('../app/models/news')(modelHelpers, connection, mongoose, moment);

    var models = {
        user: User,
        userAuthToken: UserAuthToken,
        userRole: UserRole,
        news: News
    };

    modelHelpers.createDefaultTestData(models, moment);

    return models;
};
