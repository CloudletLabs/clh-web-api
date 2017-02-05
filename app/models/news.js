module.exports = function (modelHelpers, connection, mongoose, moment) {

    var Schema = mongoose.Schema;

    var newsSchema = new Schema({
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
        var newNews = new News({
            slug: slug,
            creator: creator,
            createDate: moment().utc(),
            subject: subject,
            text: text
        });
        return newNews;
    };

    newsSchema.statics.defaultPopulate = function () {
        return this.populate('creator', 'name');
    };

    modelHelpers.deleteMongoFields(newsSchema);

    var News = connection.model('News', newsSchema);

    return News;
};
