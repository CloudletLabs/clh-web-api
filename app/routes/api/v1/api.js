var apiVersion = '1';

module.exports = function (express, app, pJson, apiHandlers, passport, models) {

    var router = express.Router();

    var log = apiHandlers.log(apiHandlers);

    var User = models.user;
    var UserAuthToken = models.userAuthToken;
    var UserRole = models.userRole;
    var News = models.news;

    /**
     * Auth
     */

    /* POST auth token. */
    router.post('/auth_token',
        passport.authenticate('basic-authentication', { session: false }),
        function (req, res, next) {
            log.info(req);

            var user = req.user;
            UserAuthToken.tokenGenerate(user, req.connection.remoteAddress, req.header('user-agent'), function (err, token) {
                if (err) return next(err);
                // Should be better way to 'depopulate' user object
                var responseObject = token.toObject();
                responseObject.user = { username: user.username };
                res.json(responseObject);
            });
        });

    /* PUT auth token. */
    router.put('/auth_token',
        passport.authenticate('bearer-renew-authentication', {session: false}),
        function (req, res, next) {
            log.info(req);

            var token = req.user;
            var user = token.user;
            UserAuthToken.tokenGenerate(user, req.connection.remoteAddress, req.header('user-agent'), function (err, newToken) {
                token.remove(function (err) {
                    if (err) return next(err);
                    res.json(newToken.toObject());
                });
            });
        });

    /* DELETE auth token. */
    router.delete('/auth_token/:token',
        passport.authenticate('bearer-authentication', {
            session: false
        }), function (req, res, next) {
            log.info(req);

            var token = req.user;
            var user = token.user;
            UserAuthToken.findOne({auth_token: req.params.token}).populate('user', 'username').exec(function (err, tokenToDelete) {
                if (err) return next(err);

                if (!tokenToDelete) {
                    log.info(req, "token not found");
                    return next({status: 404});
                }

                if (user.username != tokenToDelete.user.username) {
                    log.info(req, "cheating on %s", tokenToDelete.user.username);
                    return next({status: 401});
                }

                tokenToDelete.remove(function (err) {
                    if (err) return next(err);
                    res.send();
                });
            });
        });

    /**
     * User CRUD
     */

    /* GET current user for this token. */
    router.get('/user',
        passport.authenticate('bearer-authentication', { session: false }),
        function (req, res, next) {
            var token = req.user;
            var user = token.user;
            log.info(req);

            token.populate("user", function (err, token) {
                if (err) return next(err);
                token.user.populate("roles", "roleId", function (err, user) {
                    if (err) return next(err);
                    res.json(user.toObject());
                });
            });
        });

    /* GET users. */
    router.get('/users',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            log.info(req);

            User.find().populate("roles", "roleId").exec(function (err, users) {
                if (err) return next(err);
                res.json(users.map(function (user) { return user.toObject() }));
            });
        });

    /* GET user by username. */
    router.get('/users/:username',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            log.info(req);

            User.findOne({username: req.params.username}).populate("roles", "roleId").exec(function (err, user) {
                if (err) return next(err);

                if (!user) {
                    log.info(req, "user not found");
                    return next({status: 404, message: "User not found"});
                }

                res.json(user.toObject());
            });
        });

    /* POST user */
    router.post('/users', function (req, res, next) {
        log.info(req, "%s", req.body.username);

        User.count({username: req.body.username}, function (err, count) {
            if (err) return next(err);

            if (count > 0) {
                log.info(req, "user %s already exists", req.body.username);
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
    });

    /* PUT user */
    router.put('/users/:username',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            log.info(req);

            User.findOne({username: req.params.username}).populate("roles", "roleId").exec(function (err, user) {
                if (err) return next(err);

                if (!user) {
                    log.info(req, "user not found");
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
        });

    /* DELETE user */
    router.delete('/users/:username',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            log.info(req);

            User.findOneAndRemove({username: req.params.username}, function (err) {
                if (err) return next(err);
                res.send();
            });
        });

    /**
     * News CRUD
     */

    /* GET news. */
    router.get('/news', function (req, res, next) {
        log.info(req);

        News.find().populate("creator", "name").sort({createDate: 'desc'}).exec(function (err, news) {
            if (err) return next(err);
            res.json(news.map(function (news) { return news.toObject(); }));
        });
    });

    /* GET news by friendly url. */
    router.get('/news/:slug', function (req, res, next) {
        log.info(req);

        News.findOne({slug: req.params.slug}).populate("creator", "name").exec(function (err, news) {
            if (err) return next(err);

            if (!news) {
                log.info(req, "slug not found");
                return next({status: 404, message: "News with thus slug not found"});
            }

            res.json(news.toObject());
        });
    });

    /* POST news */
    router.post('/news',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            log.info(req);

            var token = req.user;
            var user = token.user;
            News.count({slug: req.body.slug}, function (err, count) {
                if (err) return next(err);

                if (count > 0) {
                    log.info(req, "slug %s already exists", req.body.slug);
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
        });

    /* PUT news */
    router.put('/news/:slug',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            log.info(req);

            News.findOne({slug: req.params.slug}, function (err, news) {
                if (err) return next(err);

                if (!news) {
                    log.info(req, "slug not found");
                    return next({status: 404, message: "News with this slug not found"});
                }

                if (req.body.slug && req.params.slug != req.body.slug) {
                    News.count({slug: req.body.slug}, function (err, count) {
                        if (err) return next(err);
                        if (count > 0) {
                            log.info(req, "slug %s already exists", req.body.slug);
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
        });

    /* DELETE news */
    router.delete('/news/:slug',
        passport.authorize('admin-authorization', { session: false }),
        function (req, res, next) {
            log.info(req);

            News.findOneAndRemove({slug: req.params.slug}, function (err) {
                if (err) return next(err);
                res.send();
            });
        });

    return {
        pJson: pJson,
        apiVersion: apiVersion,
        router: router,
        log: log
    };
};