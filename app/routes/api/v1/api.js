var apiVersion = '1';

module.exports = function (express, app, pJson, logger, apiHandlers, passport, controllers) {

    var router = express.Router();

    var handlers = {
        authToken: {
            post: function (req, res, next) {
                var reqId = apiHandlers.generateRequestId(req);
                logger.info(reqId);
                controllers.userAuthToken.generateNew(reqId, req.user, req.connection.remoteAddress, req.header('user-agent'),
                    function (err, result) {
                        if (err) return next(err);
                        res.json(result);
                    });
            },
            put: function (req, res, next) {
                var reqId = apiHandlers.generateRequestId(req);
                logger.info(reqId);
                controllers.userAuthToken.renew(reqId, req.user,
                    function (err, result) {
                        if (err) return next(err);
                        res.json(result);
                    });
            },
            delete: function (req, res, next) {
                var reqId = apiHandlers.generateRequestId(req);
                logger.info(reqId);
                controllers.userAuthToken.delete(reqId, req.user.user, req.params.token, function (err) {
                    if (err) return next(err);
                    res.send();
                });
            }
        },
        user: {
            get: function (req, res, next) {
                var token = req.user;
                var user = token.user;
                var reqId = apiHandlers.generateRequestId(req);
                logger.info(reqId);

                token.populate("user", function (err, token) {
                    if (err) return next(err);
                    token.user.populate("roles", "roleId", function (err, user) {
                        if (err) return next(err);
                        res.json(user.toObject());
                    });
                });
            }
        },
        users: {
            get: function (req, res, next) {
                var reqId = apiHandlers.generateRequestId(req);
                logger.info(reqId);

                User.find().populate("roles", "roleId").exec(function (err, users) {
                    if (err) return next(err);
                    res.json(users.map(function (user) {
                        return user.toObject()
                    }));
                });
            },
            post: function (req, res, next) {
                var reqId = apiHandlers.generateRequestId(req);
                logger.info(reqId, "%s", req.body.username);

                User.count({username: req.body.username}, function (err, count) {
                    if (err) return next(err);

                    if (count > 0) {
                        logger.info(req, "user %s already exists", req.body.username);
                        return next({status: 400, message: "User already exist"});
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
                                res.json(user.toObject());
                            });
                        });
                    });
                });
            },
            username: {
                get: function (req, res, next) {
                    var reqId = apiHandlers.generateRequestId(req);
                    logger.info(reqId);

                    User.findOne({username: req.params.username}).populate("roles", "roleId").exec(function (err, user) {
                        if (err) return next(err);

                        if (!user) {
                            logger.info(req, "user not found");
                            return next({status: 404, message: "User not found"});
                        }

                        res.json(user.toObject());
                    });
                },
                put: function (req, res, next) {
                    var reqId = apiHandlers.generateRequestId(req);
                    logger.info(reqId);

                    User.findOne({username: req.params.username}).populate("roles", "roleId").exec(function (err, user) {
                        if (err) return next(err);

                        if (!user) {
                            logger.info(req, "user not found");
                            return next({status: 404, message: "User not found"});
                        }

                        for (var attrname in req.body) {
                            if (attrname != "_id" && attrname != "__v")
                                user[attrname] = req.body[attrname];
                        }

                        user.save(function (err, user) {
                            if (err) return next(err);
                            res.json(user.toObject());
                        });
                    });
                },
                delete: function (req, res, next) {
                    var reqId = apiHandlers.generateRequestId(req);
                    logger.info(reqId);

                    User.findOneAndRemove({username: req.params.username}, function (err) {
                        if (err) return next(err);
                        res.send();
                    });
                }
            }
        },
        news: {
            get: function (req, res, next) {
                var reqId = apiHandlers.generateRequestId(req);
                logger.info(reqId);

                News.find().populate("creator", "name").sort({createDate: 'desc'}).exec(function (err, news) {
                    if (err) return next(err);
                    res.json(news.map(function (news) {
                        return news.toObject();
                    }));
                });
            },
            post: function (req, res, next) {
                var reqId = apiHandlers.generateRequestId(req);
                logger.info(reqId);

                var token = req.user;
                var user = token.user;
                News.count({slug: req.body.slug}, function (err, count) {
                    if (err) return next(err);

                    if (count > 0) {
                        logger.info(req, "slug %s already exists", req.body.slug);
                        return next({status: 400, message: "News with thus slug already exist"});
                    }

                    var newNews = new News(req.body);
                    newNews.creator = user;
                    newNews.save(function (err, news) {
                        if (err) return next(err);

                        news.populate("creator", "name", function (err, news) {
                            if (err) return next(err);
                            res.json(news.toObject());
                        });
                    });
                });
            },
            slug: {
                get: function (req, res, next) {
                    var reqId = apiHandlers.generateRequestId(req);
                    logger.info(reqId);

                    News.findOne({slug: req.params.slug}).populate("creator", "name").exec(function (err, news) {
                        if (err) return next(err);

                        if (!news) {
                            logger.info(req, "slug not found");
                            return next({status: 404, message: "News with thus slug not found"});
                        }

                        res.json(news.toObject());
                    });
                },
                put: function (req, res, next) {
                    var reqId = apiHandlers.generateRequestId(req);
                    logger.info(reqId);

                    News.findOne({slug: req.params.slug}, function (err, news) {
                        if (err) return next(err);

                        if (!news) {
                            logger.info(req, "slug not found");
                            return next({status: 404, message: "News with this slug not found"});
                        }

                        if (req.body.slug && req.params.slug != req.body.slug) {
                            News.count({slug: req.body.slug}, function (err, count) {
                                if (err) return next(err);
                                if (count > 0) {
                                    logger.info(req, "slug %s already exists", req.body.slug);
                                    return next({status: 400, message: "News with thus slug already exist"});
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
                                    res.json(news.toObject());
                                });
                            });
                        }
                    });
                },
                delete: function (req, res, next) {
                    var reqId = apiHandlers.generateRequestId(req);
                    logger.info(reqId);

                    News.findOneAndRemove({slug: req.params.slug}, function (err) {
                        if (err) return next(err);
                        res.send();
                    });
                }
            }
        }
    };

    var defaultPassportConfig = { session: false };

    router.post('/auth_token',
        passport.authenticate('basic-authentication', defaultPassportConfig),
        handlers.authToken.post);
    router.put('/auth_token',
        passport.authenticate('bearer-renew-authentication', defaultPassportConfig),
        handlers.authToken.put);
    router.delete('/auth_token/:token',
        passport.authenticate('bearer-authentication', defaultPassportConfig),
        handlers.authToken.delete);

    router.get('/user',
        passport.authenticate('bearer-authentication', defaultPassportConfig),
        handlers.user.get);

    router.get('/users',
        passport.authorize('admin-authorization', defaultPassportConfig),
        handlers.users.get);
    router.post('/users', handlers.users.post);

    router.get('/users/:username',
        passport.authorize('admin-authorization', defaultPassportConfig),
        handlers.users.username.get);
    router.put('/users/:username',
        passport.authorize('admin-authorization', defaultPassportConfig),
        handlers.users.username.put);
    router.delete('/users/:username',
        passport.authorize('admin-authorization', defaultPassportConfig),
        handlers.users.username.delete);

    router.get('/news', handlers.news.get);
    router.post('/news', passport.authorize('admin-authorization', defaultPassportConfig),
        handlers.news.post);

    router.get('/news/:slug', handlers.news.slug.get);
    router.put('/news/:slug',
        passport.authorize('admin-authorization', defaultPassportConfig),
        handlers.news.slug.put);
    router.delete('/news/:slug',
        passport.authorize('admin-authorization', defaultPassportConfig),
        handlers.news.slug.delete);

    return {
        pJson: pJson,
        apiVersion: apiVersion,
        router: router,
        log: log
    };
};