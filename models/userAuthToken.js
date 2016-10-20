var mongoose = require('mongoose');

module.exports = function (connection, deleteMongoFields) {

    var Schema = mongoose.Schema;

    var userAuthTokenSchema = new Schema({
        auth_token: String,
        createDate: {type: Date, required: true, default: moment().utc()},
        userAgent: String,
        ip: String,
        lastUsed: {type: Date, required: true, default: moment().utc()},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    });

    deleteMongoFields(userAuthTokenSchema);

    var UserAuthToken = connection.model('UserAuthToken', userAuthTokenSchema);

    return UserAuthToken;
};
