var mongoose = require('mongoose');
var moment = require('moment');
var expired_time = 30;

module.exports = function (connection, deleteMongoFields) {

    var Schema = mongoose.Schema;

    var userAuthTokenSchema = new Schema({
        auth_token: {type: String, index: true, unique: true, required: true, dropDups: true},
        createDate: {type: Date, required: true, default: moment().utc()},
        userAgent: String,
        ip: String,
        lastUsed: {type: Date, required: true, default: moment().utc()},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    });

    deleteMongoFields(userAuthTokenSchema);

    userAuthTokenSchema.methods.hasExpired = function () {
        return (moment().utc().diff(this.createDate, 'days')) > expired_time;
    };

    var UserAuthToken = connection.model('UserAuthToken', userAuthTokenSchema);

    return UserAuthToken;
};
