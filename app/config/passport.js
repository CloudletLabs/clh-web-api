module.exports = function (passport, passportHelpers, models, moment, BasicStrategy, BearerStrategy) {

    var UserAuthToken = models.userAuthToken;
    var User = models.user;

    /**
     * Strategy for username+password auth
     */
    passport.use('basic-authentication', new BasicStrategy(
        function (username, password, done) {
            User.findOne({
                username: username,
                password: password
            }, function (err, user) {
                if (err) return done(err);
                if (!user) return done(null, false);
                return done(null, user);
            });
        }
    ));

    /**
     * Strategy for token auth
     */
    passport.use('bearer-authentication', new BearerStrategy({ passReqToCallback: true },
        function (req, token, done) {
            passportHelpers.authByToken(UserAuthToken, moment, req, token, true, done);
        }
    ));

    /**
     * Strategy for token auth renew
     */
    passport.use('bearer-renew-authentication', new BearerStrategy({ passReqToCallback: true },
        function (req, token, done) {
            passportHelpers.authByToken(UserAuthToken, moment, req, token, false, done);
        }
    ));

    /**
     * Strategy for token auth and ADMIN role checking
     */
    passport.use('user-authorization', new BearerStrategy({ passReqToCallback: true },
        function (req, token, done) {
            passportHelpers.authByRole(UserAuthToken, moment, req, token, 'USER', done);
        }
    ));

    /**
     * Strategy for token auth and ADMIN role checking
     */
    passport.use('admin-authorization', new BearerStrategy({ passReqToCallback: true },
        function (req, token, done) {
            passportHelpers.authByRole(UserAuthToken, moment, req, token, 'ADMIN', done);
        }
    ));
};