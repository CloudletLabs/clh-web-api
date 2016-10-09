var mongoose = require('mongoose');
var moment = require('moment');

module.exports = function (connection, deleteMongoFields) {

    var Schema = mongoose.Schema;

    var newsSchema = new Schema({
        slug: {type: String, index: true, unique: true, required: true, dropDups: true},
        creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        createDate: {type: Date, required: true, default: moment().utc()},
        subject: {type: String, required: true},
        text: {type: String, required: true}
    });

    deleteMongoFields(newsSchema);

    var News = connection.model('News', newsSchema);

    return News;
};
