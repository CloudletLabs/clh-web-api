'use strict';

module.exports = function (logger, models, controllerHelpers) {

    let News = models.news;

    return {
        getAll: function (done) {
            controllerHelpers.get(News.find().sort({createDate: 'desc'}), News.defaultPopulate, done);
        },
        create: function (creator, news, done) {
            let newNews = News.generateNew(news.slug, creator, news.subject, news.text);
            controllerHelpers.create(News.count({slug: news.slug}), newNews, News.defaultPopulate, done);
        },
        get: function (slug, done) {
            controllerHelpers.get(News.findOne({slug: slug}), News.defaultPopulate, done);
        },
        update: function (slug, updatedNews, done) {
            controllerHelpers.update(News.findOne({slug: slug}),
                (updatedNews.slug && slug != updatedNews.slug) ? News.count({slug: updatedNews.slug}) : null,
                updatedNews, News.defaultPopulate, done);
        },
        remove: function (slug, done) {
            controllerHelpers.remove(News.findOneAndRemove({slug: slug}).exec(), done);
        }
    };
};
