/**
 * Load strategies
 */
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

/**
 * RFC4122 Universally Unique IDentifier (UUID) generator
 */
var uuid = require('node-uuid');

/**
 * Some additional modules
 */
var moment = require('moment');

module.exports = function (passport, models) {

    var User = models.user;

    /**
     * Serialize user for the session
     */
    passport.serializeUser(function (user, done) {
        done(null, user.username);
    });

    /**
     * Deserialize user from the session
     */
    passport.deserializeUser(function (username, done) {
        User.findOne({username: username})
            .populate('roles')
            .exec(function (err, user) {
                done(err, user);
            });
    });

    /**
     * Strategy for username+password auth
     */
    passport.use('local-login', new LocalStrategy(
        function (username, password, done) {
            User.findOne({
                username: username,
                password: password
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }

                if (!user.token.auth_token || user.hasExpired()) {
                    user.token.auth_token = uuid.v1();
                    user.token.createDate = moment().utc();

                    user.save(function (err, user) {
                        if (err) {
                            return done(err);
                        }
                        return done(null, user);
                    });
                } else {
                    return done(null, user);
                }
            });
        }
    ));

    /**
     * Strategy for token auth
     */
    passport.use('local-authorization', new BearerStrategy(
        function (token, done) {
            authUserByToken(token, done, function (user) {
                return done(null, user, {scope: 'all'});
            });
        }
    ));

    /**
     * Strategy for token auth + ADMIN role checking
     */
    passport.use('admin-authorization', new BearerStrategy(
        function (token, done) {
            authUserByToken(token, done, function (user) {
                if (user.roles.some(function (role) {
                        return role.roleId == 'ADMIN';
                    })) {
                    return done(null, user, {scope: 'all'});
                }
                return done(null, false);
            });
        }
    ));

    /**
     * Get user by token
     * @param token
     * @param done - passport done function (used in case of errors)
     * @param callback - callback when success (for additional checks)
     */
    function authUserByToken(token, done, callback) {
        User.findOne({'token.auth_token': token})
            .populate('roles')
            .exec(function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (user.hasExpired()) {
                    return done(null, false);
                }
                return callback(user);
            });
    }

};