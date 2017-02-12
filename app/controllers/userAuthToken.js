'use strict';

module.exports = function (logger, models, controllerHelpers) {

    let UserAuthToken = models.userAuthToken;

    return {
        generateNew: function (user, ip, userAgent, done) {
            let newToken = UserAuthToken.generateNew(user, ip, userAgent);
            controllerHelpers.create(
                UserAuthToken.count({auth_token: newToken.auth_token}), newToken, UserAuthToken.defaultPopulate, done);
        },
        renew: function (token, done) {
            let newToken = UserAuthToken.generateNew(token.user, token.ip, token.userAgent);
            controllerHelpers.create(
                UserAuthToken.count({auth_token: newToken.auth_token}), newToken, UserAuthToken.defaultPopulate, done,
                function (newToken) {
                    controllerHelpers.remove(token.remove(), done, function () {
                        done(null, newToken.toObject());
                    });
                });
        },
        delete: function (user, token, done) {
            controllerHelpers.exec(UserAuthToken.findOne({auth_token: token}).populate('user', 'username'), done,
                function (tokenObject) {
                    if (user.username != tokenObject.user.username) return done();

                    controllerHelpers.remove(tokenObject.remove(), done);
                });
        }
    }
};