'use strict';

let helper = {
    authByRole: function (UserAuthToken, moment, req, token, roleId, done) {
        helper.authByToken(UserAuthToken, moment, req, token, true, function (err, userAuthToken) {
            if (err) return done(err);
            if (!userAuthToken) return done(null, false);
            helper._checkRole(userAuthToken.user, roleId, done);
        });
    },
    _checkRole: function (user, roleId, done) {
        if (user.roles.some(function (role) {
                return role.roleId == roleId;
            })) {
            done(null, user);
        } else {
            done(null, false);
        }
    },
    authByToken: function (UserAuthToken, moment, req, token, checkExpire, done) {
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

module.exports = helper;