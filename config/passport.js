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

    var UserAuthToken = models.userAuthtoken;

    /**
     * Strategy for username+password auth
     */
    passport.use('password-authentication', new LocalStrategy({ passReqToCallback: true },
        function (req, username, password, done) {
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
                return done(null, user);
            });
        }
    ));

    /**
     * Strategy for token auth
     */
    passport.use('bearer-authentication', new BearerStrategy({ passReqToCallback: true },
        function (req, token, done) {
            authByToken(req, token, true, done);
        }
    ));

    /**
     * Strategy for local local-renew-authorization
     */
    passport.use('bearer-renew-authentication', new BearerStrategy({ passReqToCallback: true },
        function (req, token, done) {
            authByToken(req, token, false, done);
        }
    ));

    /**
     * ADMIN role checking
     */
    passport.use('admin-authorization', new BearerStrategy({ passReqToCallback: true },
        function (req, token, done) {
            if (req.user) {
                authByRole(req, 'ADMIN', done);
            } else {
                authByToken(req, token, false, function (err, userAuthToken) {
                    if (err) return done(err);
                    req.user = userAuthToken;
                    authByRole(req, 'ADMIN', done);
                });
            }
        }
    ));

    function authByRole(req, roleId, done) {
        if (req.user.user.roles.some(function (role) {
                return role.roleId == roleId;
            })) {
            return done(null, req.user.user);
        } else {
            done(null, false);
        }
    }

    /**
     * Auth by token
     * @param token
     * @param done - passport done function (used in case of errors)
     */
    function authByToken(req, token, checkExpire, done) {
        UserAuthToken.findOne({'auth_token': token})
            .exec(function (err, userAuthToken) {
                if (err) return done(err);
                if (!userAuthToken) {
                    return done(null, false);
                }
                if (checkExpire && userAuthToken.hasExpired()) {
                    return done(null, false);
                }
                if (userAuthToken.userAgent != req.userAgent) {
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