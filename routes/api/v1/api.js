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
        res.send('ok');
    });

    /* GET info. */
    router.get('/info', function (req, res, next) {
        res.json({name: pjson.name, version: pjson.version, apiVersion: apiVersion});
    });

    /**
     * Auth
     */

    /* POST auth token. */
    router.post('/auth_token',
        passport.authenticate('local-login', {
            session: false
        }), function (req, res, next) {
            console.info("[%s] POST auth_token", req.user.username);
            res.json({auth_token: req.user.token.auth_token});
        });

    /* PUT auth token. */
    router.put('/auth_token',
        passport.authenticate('local-renew-authorization', {
            session: false
        }), function (req, res, next) {
            console.info("[%s] PUT auth_token", req.user.username);
            var user = req.user;
            user.tokenRegenerate();

            user.save(function (err, user) {
                if (err) return next(err);
                res.json({auth_token: user.token.auth_token});
            });
        });

    /**
     * User CRUD
     */

    /* GET current user for this token. */
    router.get('/user',
        passport.authenticate('local-authorization', {
            session: false
        }), function (req, res, next) {
            console.info("[%s] GET user by it's token", req.user.username);
            res.json(req.user);
        });

    /* GET users. */
    router.get('/users',
        passport.authenticate('admin-authorization', {
            session: false
        }), function (req, res, next) {
            console.info("[%s] GET users", req.user.username);
            User.find(function (err, users) {
                if (err) return next(err);
                res.json(users);
            });
        });

    /* GET user by username. */
    router.get('/users/:username',
        passport.authenticate('admin-authorization', {
            session: false
        }), function (req, res, next) {
            console.info("[%s] GET user %s", req.user.username, req.params.username);
            User.findOne({username: req.params.username}, function (err, user) {
                if (err) return next(err);
                if (!user) {
                    res.status(404).json({message: "User not found"});
                    return;
                }

                res.json(user);
            });
        });

    /* POST user */
    router.post('/users', function (req, res, next) {
        console.info("POST user %s", req.body.username);
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

                    console.info('New user %s created', user.username);
                    res.json(user);
                });
            });
        });
    });

    /* PUT user */
    router.put('/users/:username',
        passport.authenticate('admin-authorization', {
            session: false
        }), function (req, res, next) {
            console.info("[%s] PUT user %s", req.user.username, req.params.username);
            User.findOne({username: req.params.username}, function (err, user) {
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
                    res.json(user);
                });
            });
        });

    /* DELETE user */
    router.delete('/users/:username',
        passport.authenticate('admin-authorization', {
            session: false
        }), function (req, res, next) {
            console.info("[%s] DELETE user %s", req.user.username, req.params.username);
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
        News.find().populate("creator", "name").sort({createDate: 'desc'}).exec(function (err, news) {
            if (err) return next(err);
            res.json(news);
        });
    });

    /* GET news by friendly url. */
    router.get('/news/:slug', function (req, res, next) {
        News.findOne({slug: req.params.slug}).populate("creator", "name").exec(function (err, news) {
            if (err) return next(err);
            if (!news) return res.status(404).json({message: "News with thus slug not found"});
            res.json(news);
        });
    });

    /* POST news */
    router.post('/news',
        passport.authenticate('admin-authorization', {
            session: false
        }), function (req, res, next) {
            console.info("[%s] POST news %s", req.user.username, req.body.slug);
            News.count({slug: req.body.slug}, function (err, count) {
                if (err) return next(err);
                if (count > 0) {
                    res.status(400).json({message: "News with thus slug already exist"});
                    return;
                }

                var newNews = new News(req.body);
                newNews.creator = req.user;
                newNews.save(function (err, news) {
                    if (err) return next(err);

                    news.populate("creator", "name", function (err, news) {
                        if (err) return next(err);

                        console.info('New news %s created', news.slug);
                        res.json(news);
                    });
                });
            });
        });

    /* PUT news */
    router.put('/news/:slug',
        passport.authenticate('admin-authorization', {
            session: false
        }), function (req, res, next) {
            console.info("[%s] PUT news %s", req.user.username, req.params.slug);
            News.findOne({slug: req.params.slug}, function (err, news) {
                if (err) return next(err);
                if (!news) {
                    res.status(404).json({message: "News with this slug not found"});
                    return;
                }

                if (req.body.slug) {
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
                            res.json(news);
                        });
                    });
                }
            });
        });

    /* DELETE news */
    router.delete('/news/:slug',
        passport.authenticate('admin-authorization', {
            session: false
        }), function (req, res, next) {
            console.info("[%s] DELETE news by slug %s", req.user.username, req.params.slug);
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
}