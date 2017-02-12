'use strict';

module.exports = function (modelHelpers, connection, mongoose, moment) {

    let Schema = mongoose.Schema;

    let newsSchema = new Schema({
        slug: {type: String, index: true, unique: true, required: true, dropDups: true},
        creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        createDate: {type: Date, required: true, default: moment().utc()},
        subject: {type: String, required: true},
        text: {type: String, required: true}
    });

    newsSchema.methods.toString = function () {
        return this.slug;
    };

    newsSchema.statics.generateNew = function (slug, creator, subject, text) {
        return new News({
            slug: slug,
            creator: creator,
            createDate: moment().utc(),
            subject: subject,
            text: text
        });
    };

    newsSchema.statics.defaultPopulate = function () {
        return this.populate('creator', 'name');
    };

    modelHelpers.deleteMongoFields(newsSchema);

    let News = connection.model('News', newsSchema);

    return News;
};
