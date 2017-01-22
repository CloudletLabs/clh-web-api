module.exports = {
    authByRole: function (helper, req, token, roleId, done) {
        if (req.user) {
            helper._checkRole(req, roleId, done);
        } else {
            helper.authByToken(req, token, true, function (err, userAuthToken) {
                if (err) return done(err);
                req.user = userAuthToken;
                helper._checkRole(req, roleId, done);
            });
        }
    },
    _checkRole: function (req, roleId, done) {
        if (req.user.user.roles.some(function (role) {
                return role.roleId == roleId;
            })) {
            done(null, req.user.user);
        } else {
            done(null, false);
        }
    },
    authByToken: function (helper, UserAuthToken, moment, req, token, checkExpire, done) {
        UserAuthToken.findOne({'auth_token': token})
            .populate('user', 'username roles')
            .exec(function (err, userAuthToken) {
                if (err) return done(err);
                if (!userAuthToken) return done(null, false);

                helper._checkToken(moment, req, userAuthToken, checkExpire, done);
            });
    },
    _checkToken: function (moment, req, userAuthToken, checkExpire, done) {
        userAuthToken.user.populate('roles', 'roleId', function (err) {
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
    }
};