module.exports = function (logger, models, controllerHelpers) {

    var News = models.news;

    var controller = {
        getAll: function (done) {
            controllerHelpers.getAll(News.find().sort({createDate: 'desc'}), News.defaultPopulate, done);
        },
        create: function (creator, news, done) {
            var newNews = new News(news);
            newNews.creator = creator;
            controllerHelpers.create(News.count({slug: news.slug}), newNews, News.defaultPopulate, done);
        },
        get: function (slug, done) {
            controllerHelpers.get(News.findOne({slug: slug}), News.defaultPopulate, done);
        },
        update: function (slug, updatedNews, done) {
            News.findOne({slug: slug}, function (err, news) {
                if (err) return done(err);

                if (!news) {
                    return done({status: 404, message: "News with this slug not found"});
                }

                if (updatedNews.slug && slug != updatedNews.slug) {
                    News.count({slug: updatedNews.slug}, function (err, count) {
                        if (err) return done(err);
                        if (count > 0) {
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
    };

    return controller;
};
