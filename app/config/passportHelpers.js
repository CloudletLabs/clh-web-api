module.exports = {
    authByRole: function (helper, req, token, roleId, done) {
        if (req.user) {
            helper.authByRole(req, roleId, done);
        } else {
            helper.authByToken(req, token, true, function (err, userAuthToken) {
                if (err) return done(err);
                req.user = userAuthToken;
                helper.checkRole(req, roleId, done);
            });
        }
    },
    checkRole: function (req, roleId, done) {
        if (req.user.user.roles.some(function (role) {
                return role.roleId == roleId;
            })) {
            return done(null, req.user.user);
        } else {
            done(null, false);
        }
    },
    /**
     * Auth by token
     * @param req
     * @param token
     * @param checkExpire - check if token is expired
     * @param done - passport done function (used in case of errors)
     */
    authByToken: function (UserAuthToken, req, token, checkExpire, done) {
        UserAuthToken.findOne({'auth_token': token})
            .populate('user', 'username roles')
            .exec(function (err, userAuthToken) {
                if (err) return done(err);

                if (!userAuthToken) {
                    return done(null, false);
                }

                userAuthToken.user.populate('roles', 'roleId', function (err, user) {
                    if (err) return done(err);

                    if (checkExpire && userAuthToken.hasExpired()) {
                        return done(null, false);
                    }
                    if (userAuthToken.userAgent != req.header('user-agent')) {
                        return done(null, false);
                    }
                    userAuthToken.ip = req.connection.remoteAddress;
                    userAuthToken.lastUsed = moment.utc();
                    userAuthToken.save(function (err, userAuthToken) {
                        if (err) return done(err);
                        return done(null, userAuthToken);
                    });
                });
            });
    }
};