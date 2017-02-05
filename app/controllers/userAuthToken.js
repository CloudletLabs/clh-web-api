module.exports = function (logger, models, controllerHelpers) {

    var UserAuthToken = models.userAuthToken;

    return {
        generateNew: function (user, ip, userAgent, done) {
            var newToken = UserAuthToken.generateNew(user, ip, userAgent);
            controllerHelpers.create(
                UserAuthToken.count({auth_token: newToken.auth_token}), newToken, UserAuthToken.defaultPopulate, done);
        },
        renew: function (token, done) {
            var newToken = UserAuthToken.generateNew(token.user, token.ip, token.userAgent);
            newToken.save(function (err, newToken) {
                if (err) return done(err);
                if (!newToken) return done({message: 'Token was null after regeneration'});
                token.remove(function (err) {
                    if (err) return done(err);
                    done(null, newToken.toObject());
                });
            });
        },
        delete: function (user, token, done) {
            UserAuthToken.findOne({auth_token: token}).populate('user', 'username').exec(function (err, tokenObject) {
                if (err) return done(err);
                if (!tokenObject) return done();
                if (user.username != tokenObject.user.username) return done();

                tokenObject.remove(function (err) {
                    if (err) return done(err);
                    done(null, {});
                });
            });
        }
    }
};