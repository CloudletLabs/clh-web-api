var apiVersion = '1';

module.exports = function (express, app, pJson, logger, apiHandlers, passport, controllers) {

    var router = express.Router();

    var defaultPassportConfig = { session: false };

    router.post('/auth_token',
        passport.authenticate('basic-authentication', defaultPassportConfig),
        function (req, res, next) {
            controllers.userAuthToken.generateNew(req.account, req.connection.remoteAddress, req.header('user-agent'),
                apiHandlers.sendRes(res, next));
        });
    router.put('/auth_token',
        passport.authenticate('bearer-renew-authentication', defaultPassportConfig),
        function (req, res, next) {
            controllers.userAuthToken.renew(req.logPrefix, req.account, apiHandlers.sendRes(res, next));
        });
    router.delete('/auth_token/:token',
        passport.authenticate('bearer-authentication', defaultPassportConfig),
        function (req, res, next) {
            controllers.userAuthToken.delete(req.logPrefix, req.account.user, req.params.token,
                apiHandlers.sendRes(res, next));
        });

    router.get('/user',
        passport.authenticate('bearer-authentication', defaultPassportConfig),
        function (req, res, next) {
            controllers.user.populateFromToken(req.account, apiHandlers.sendRes(res, next));
        });

    router.get('/users',
        passport.authorize('admin-authorization', defaultPassportConfig),
        function (req, res, next) {
            controllers.user.getAll(apiHandlers.sendRes(res, next));
        });
    router.post('/users',
        function (req, res, next) {
            controllers.user.create(req.logPrefix, req.body, apiHandlers.sendRes(res, next));
        });

    router.get('/users/:username',
        passport.authorize('admin-authorization', defaultPassportConfig),
        function (req, res, next) {
            controllers.user.get(req.logPrefix, req.params.username, apiHandlers.sendRes(res, next));
        });
    router.put('/users/:username',
        passport.authorize('admin-authorization', defaultPassportConfig),
        function (req, res, next) {
            controllers.user.update(req.logPrefix, req.params.username, req.body, apiHandlers.sendRes(res, next));
        });
    router.delete('/users/:username',
        passport.authorize('admin-authorization', defaultPassportConfig),
        function (req, res, next) {
            controllers.user.remove(req.params.username, apiHandlers.sendRes(res, next));
        });

    router.get('/news',
        function (req, res, next) {
            controllers.news.getAll(apiHandlers.sendRes(res, next));
        });
    router.post('/news',
        passport.authorize('admin-authorization', defaultPassportConfig),
        function (req, res, next) {
            controllers.news.create(req.logPrefix, req.user, req.body, apiHandlers.sendRes(res, next));
        });

    router.get('/news/:slug',
        function (req, res, next) {
            controllers.news.get(req.logPrefix, req.params.slug, apiHandlers.sendRes(res, next));
        });
    router.put('/news/:slug',
        passport.authorize('admin-authorization', defaultPassportConfig),
        function (req, res, next) {
            controllers.news.update(req.logPrefix, req.params.slug, req.body, apiHandlers.sendRes(res, next));
        });
    router.delete('/news/:slug',
        passport.authorize('admin-authorization', defaultPassportConfig),
        function (req, res, next) {
            controllers.news.remove(req.params.slug, apiHandlers.sendRes(res, next));
        });

    return {
        pJson: pJson,
        apiVersion: apiVersion,
        router: router
    };
};