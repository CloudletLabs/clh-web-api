module.exports = function (logger, models) {

    var UserAuthToken = models.userAuthToken;

    return {
        generateNew: function (user, ip, userAgent, done) {
            UserAuthToken.generateNew(user, ip, userAgent, function (err, token) {
                if (err) return done(err);
                // Should be better way to 'depopulate' user object
                var result = token.toObject();
                result.user = {username: user.username};
                done(null, result);
            });
        },
        renew: function (logPrefix, token, done) {
            UserAuthToken.generateNew(token.user, token.ip, token.userAgent, function (err, newToken) {
                if (err) return done(err);
                if (!newToken) {
                    logger.info(logPrefix, "regenerated token saving failed");
                    return done({status: 500, message: 'Error during saving new token'});
                }
                token.remove(function (err) {
                    if (err) return done(err);
                    done(null, newToken.toObject());
                });
            });
        },
        delete: function (logPrefix, user, token, done) {
            UserAuthToken.findOne({auth_token: token}).populate('user', 'username').exec(function (err, tokenObject) {
                if (err) return done(err);

                if (!tokenObject) {
                    logger.info(logPrefix, "token not found");
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