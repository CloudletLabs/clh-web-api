module.exports = function (logger, models) {

    var UserAuthToken = models.userAuthToken;

    return {
        generateNew: function (user, ip, userAgent, done) {
            UserAuthToken.generateNew(user, ip, userAgent, function (err, token) {
                if (err) return done(err);
                if (!token) return done({message: 'Token was null after generation'});
                // Should be better way to 'depopulate' user object
                var result = token.toObject();
                result.user = {username: user.username};
                done(null, result);
            });
        },
        renew: function (token, done) {
            UserAuthToken.generateNew(token.user, token.ip, token.userAgent, function (err, newToken) {
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