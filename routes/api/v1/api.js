var express = require('express');
var pjson = require('../../../package.json');
var apiVersion = '1';

module.exports = function (app, passport, models) {

    /**
     * Create new router for api
     */
    var router = express.Router();

    /**
     * Map this router for relative path
     */
    app.use('/api/v' + apiVersion, router);
    app.use('/api/current', router);

    /**
     * Error handlers
     * TODO: is it secure always return err object?
     */
    app.use('/api/v' + apiVersion, apiErrorHandler);
    app.use('/api/current', apiErrorHandler);
    function apiErrorHandler(err, req, res, next) {
        res.status(err.status || 500);
        res.json(err);
    }

    var User = models.user;
    var UserRole = models.userRole;
    var News = models.news;

    /**
     * Service calls
     */

    /* GET status. */
    router.get('/status', function (req, res, next) {
        console.info("[%s][%s] /status", req.type, req.connection.remoteAddress);
        res.send('ok');
    });

    /* GET info. */
    router.get('/info', function (req, res, next) {
        console.info("[%s][%s] /info", req.type, req.connection.remoteAddress);
        res.json({name: pjson.name, version: pjson.version, apiVersion: apiVersion});
    });

    /**
     * Auth
     */

    /* POST auth token. */
    router.post('/auth_token',
        passport.authenticate('password-authentication', { session: false }),
        function (req, res, next) {
            var user = req.user;
            console.info("[%s][%s][%s] /auth_token", req.type, req.connection.remoteAddress, user.username);

            var token = user.tokenGenerate(req.connection.remoteAddress, req.userAgent);
            user.save(function (err, user) {
                if (err) return next(err);
                res.json(token);
            });
        });

    /* PUT auth token. */
    router.put('/auth_token',
        passport.authenticate('bearer-renew-authentication', { session: false }),
        function (req, res, next) {
            var token = req.user;
            var user = token.user;
            console.info("[%s][%s][%s] /auth_token", req.type, req.connection.remoteAddress, user.username);

            var newToken = user.tokenGenerate(req.connection.remoteAddress, req.userAgent);
            oldTokenIndex = user.tokens.indexOf(token);
            user.tokens.slice(oldTokenIndex, 1);

            user.save(function (err, user) {
                if (err) return next(err);
                res.json(newToken);
            });
        });

    /* DELETE auth token. */
    router.delete('/auth_token',
        passport.authenticate('bearer-authentication', {
            session: false
        }), function (req, res, next) {
            console.info("[%s] DELETE user.auth_token %s", req.userAuthToken);
            var user = req.user;
            user.tokenGenerate();
            /* if (user.userAuthToken = user.tokenGenerate.token){ */
            if (user.userAuthToken = token){
                User.findOneAndRemove({userAuthToken: req.userAuthToken}, function (err) {
                    if (err) return next(err);

                    console.info('userAuthToken %s deleted', req.userAuthToken);
                    res.json({});
                });
            }});

    /**
     * User CRUD
     */

    /* GET current user for this token. */
    router.get('/user',
        passport.authenticate('bearer-authentication', { session: false }),
        function (req, res, next) {
            var token = req.user;
            var user = token.user;
            console.info("[%s][%s][%s] /user", req.type, req.connection.remoteAddress, user.username);

            user.populate("roles", "roleId", function (err, user) {
                if (err) return next(err);
                res.json(user.toObject());
            });
        });

    /* GET users. */
    router.get('/users',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            var token = req.user;
            var user = token.user;
            console.info("[%s][%s][%s] /users", req.type, req.connection.remoteAddress, user.username);

            User.find().populate("roles", "roleId").exec(function (err, users) {
                if (err) return next(err);
                res.json(users.map(function (user) { return user.toObject() }));
            });
        });

    /* GET user by username. */
    router.get('/users/:username',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            var token = req.user;
            var user = token.user;
            console.info("[%s][%s][%s] /users/%s", req.type, req.connection.remoteAddress, user.username, req.params.username);

            User.findOne({username: req.params.username}).populate("roles", "roleId").exec(function (err, user) {
                if (err) return next(err);
                if (!user) {
                    res.status(404).json({message: "User not found"});
                    return;
                }

                res.json(user.toObject());
            });
        });

    /* POST user */
    router.post('/users', function (req, res, next) {
        console.info("[%s][%s][%s] /users", req.type, req.connection.remoteAddress, req.body.username);

        User.count({username: req.body.username}, function (err, count) {
            if (err) return next(err);
            if (count > 0) {
                res.status(400).json({message: "User already exist"});
                return;
            }

            UserRole.findOne({roleId: 'USER'}, function (err, role) {
                if (err) return next(err);

                var newUser = new User(req.body);
                newUser.avatar = 'img/mockUser2.jpg';
                newUser.roles.push(role);
                newUser.save(function (err, user) {
                    if (err) return next(err);

                    user.populate("roles", "roleId", function (err, user) {
                        if (err) return next(err);

                        console.info('New user %s created', user.username);
                        res.json(user.toObject());
                    });
                });
            });
        });
    });

    /* PUT user */
    router.put('/users/:username',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            var token = req.user;
            var user = token.user;
            console.info("[%s][%s][%s] /users/%s", req.type, req.connection.remoteAddress, user.username, req.params.username);

            User.findOne({username: req.params.username}).populate("roles", "roleId").exec(function (err, user) {
                if (err) return next(err);
                if (!user) {
                    res.status(404).json({message: "User not found"});
                    return;
                }

                for (var attrname in req.body) {
                    if (attrname != "_id" && attrname != "__v")
                        user[attrname] = req.body[attrname];
                }

                user.save(function (err, user) {
                    if (err) return next(err);

                    console.info('User %s updated', user.username);
                    res.json(user.toObject());
                });
            });
        });

    /* DELETE user */
    router.delete('/users/:username',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            var token = req.user;
            var user = token.user;
            console.info("[%s][%s][%s] /users/%s", req.type, req.connection.remoteAddress, user.username, req.params.username);

            User.findOneAndRemove({username: req.params.username}, function (err) {
                if (err) return next(err);

                console.info('User %s deleted', req.params.username);
                res.json({});
            });
        });

    /**
     * News CRUD
     */

    /* GET news. */
    router.get('/news', function (req, res, next) {
        console.info("[%s][%s] /news", req.type, req.connection.remoteAddress);

        News.find().populate("creator", "name").sort({createDate: 'desc'}).exec(function (err, news) {
            if (err) return next(err);
            res.json(news.map(function (news) { return news.toObject(); }));
        });
    });

    /* GET news by friendly url. */
    router.get('/news/:slug', function (req, res, next) {
        console.info("[%s][%s] /news/%s", req.type, req.connection.remoteAddress, req.params.slug);

        News.findOne({slug: req.params.slug}).populate("creator", "name").exec(function (err, news) {
            if (err) return next(err);
            if (!news) return res.status(404).json({message: "News with thus slug not found"});
            res.json(news.toObject());
        });
    });

    /* POST news */
    router.post('/news',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            var token = req.user;
            var user = token.user;
            console.info("[%s][%s][%s] /news", req.type, req.connection.remoteAddress, user.username);

            News.count({slug: req.body.slug}, function (err, count) {
                if (err) return next(err);
                if (count > 0) {
                    res.status(400).json({message: "News with thus slug already exist"});
                    return;
                }

                var newNews = new News(req.body);
                newNews.creator = user;
                newNews.save(function (err, news) {
                    if (err) return next(err);

                    news.populate("creator", "name", function (err, news) {
                        if (err) return next(err);

                        console.info('New news %s created', news.slug);
                        res.json(news.toObject());
                    });
                });
            });
        });

    /* PUT news */
    router.put('/news/:slug',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            var token = req.user;
            var user = token.user;
            console.info("[%s][%s][%s] /news/%s", req.type, req.connection.remoteAddress, user.username, req.params.slug);

            News.findOne({slug: req.params.slug}, function (err, news) {
                if (err) return next(err);
                if (!news) {
                    res.status(404).json({message: "News with this slug not found"});
                    return;
                }

                if (req.body.slug && req.params.slug != req.body.slug) {
                    News.count({slug: req.body.slug}, function (err, count) {
                        if (err) return next(err);
                        if (count > 0) {
                            res.status(400).json({message: "News with thus slug already exist"});
                            return;
                        }
                        updateNews();
                    });
                } else {
                    updateNews();
                }
                
                function updateNews() {
                    for (var attrname in req.body) {
                        if (attrname != "_id" && attrname != "__v")
                            news[attrname] = req.body[attrname];
                    }

                    news.save(function (err, news) {
                        if (err) return next(err);

                        news.populate("creator", "name", function (err, news) {
                            if (err) return next(err);

                            console.info('News %s updated', news.slug);
                            res.json(news.toObject());
                        });
                    });
                }
            });
        });

    /* DELETE news */
    router.delete('/news/:slug',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            var token = req.user;
            var user = token.user;
            console.info("[%s][%s][%s] /news/%s", req.type, req.connection.remoteAddress, user.username, req.params.slug);

            News.findOneAndRemove({slug: req.params.slug}, function (err) {
                if (err) return next(err);

                console.info('News %s deleted', req.params.slug);
                res.json({});
            });
        });

    /**
     * 404
     */
    router.use(function (req, res, next) {
        res.status(404);
        res.json({message: 'Not found'});
    });

    return router;
};