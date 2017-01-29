module.exports = function (logger, models) {

    var News = models.news;

    return {
        getAll: function (done) {
            News.find().populate("creator", "name").sort({createDate: 'desc'}).exec(function (err, news) {
                if (err) return done(err);
                done(null, news.map(function (news) {
                    return news.toObject();
                }));
            });
        },
        create: function (logPrefix, creator, news, done) {
            News.count({slug: news.slug}, function (err, count) {
                if (err) return done(err);

                if (count > 0) {
                    logger.info(logPrefix, "slug %s already exists", news.slug);
                    return done({status: 400, message: "News with thus slug already exist"});
                }

                var newNews = new News(news);
                newNews.creator = creator;
                newNews.save(function (err, news) {
                    if (err) return done(err);

                    news.populate("creator", "name", function (err, news) {
                        if (err) return done(err);
                        done(null, news.toObject());
                    });
                });
            });
        },
        get: function (logPrefix, slug, done) {
            News.findOne({slug: slug}).populate("creator", "name").exec(function (err, news) {
                if (err) return done(err);

                if (!news) {
                    logger.info(logPrefix, "slug %s not found", slug);
                    return done({status: 404, message: "News with thus slug not found"});
                }

                done(null, news.toObject());
            });
        },
        update: function (logPrefix, slug, updatedNews, done) {
            News.findOne({slug: slug}, function (err, news) {
                if (err) return done(err);

                if (!news) {
                    logger.info(logPrefix, "slug %s not found", slug);
                    return done({status: 404, message: "News with this slug not found"});
                }

                if (updatedNews.slug && slug != updatedNews.slug) {
                    News.count({slug: updatedNews.slug}, function (err, count) {
                        if (err) return done(err);
                        if (count > 0) {
                            logger.info(logPrefix, "slug %s already exists", updatedNews.slug);
                            return done({status: 400, message: "News with thus slug already exist"});
                        }
                        updateNews();
                    });
                } else {
                    updateNews();
                }

                function updateNews() {
                    for (var attrname in updatedNews) {
                        if (attrname != "_id" && attrname != "__v")
                            news[attrname] = updatedNews[attrname];
                    }

                    news.save(function (err, news) {
                        if (err) return done(err);

                        news.populate("creator", "name", function (err, news) {
                            if (err) return done(err);
                            done(null, news.toObject());
                        });
                    });
                }
            });
        },
        remove: function (slug, done) {
            News.findOneAndRemove({slug: slug}, function (err) {
                if (err) return done(err);
                done();
            });
        }
    }
};