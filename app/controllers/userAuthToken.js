module.exports = function (logger, models) {

    var User = models.user;
    var UserAuthToken = models.userAuthToken;
    var UserRole = models.userRole;
    var News = models.news;

    return {
        generateNew: function (reqId, ip, userAgent, done) {
            UserAuthToken.generateNew(user, ip, userAgent, function (err, token) {
                if (err) return done(err);
                // Should be better way to 'depopulate' user object
                var result = token.toObject();
                result.user = {username: user.username};
                done(null, result);
            });
        },
        renew: function (reqId, token, done) {
            UserAuthToken.generateNew(token.user, ip, userAgent, function (err, newToken) {
                token.remove(function (err) {
                    if (err) return done(err);
                    done(null, newToken.toObject());
                });
            });
        },
        delete: function (reqId, user, token, done) {
            UserAuthToken.findOne({auth_token: token}).populate('user', 'username').exec(function (err, tokenObject) {
                if (err) return done(err);

                if (!tokenObject) {
                    logger.info(reqId, "token not found");
                    return done({status: 404});
                }

                if (user.username != tokenObject.user.username) {
                    logger.warn(reqId, "cheating on %s", tokenObject.user.username);
                    return done({status: 401});
                }

                tokenObject.remove(function (err) {
                    if (err) return done(err);
                    done();
                });
            });
        }
    }
};