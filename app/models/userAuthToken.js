'use strict';

module.exports = function (modelHelpers, connection, mongoose, moment, uuid, expired_time) {

    var Schema = mongoose.Schema;

    var userAuthTokenSchema = new Schema({
        auth_token: {type: String, index: true, unique: true, required: true, dropDups: true},
        createDate: {type: Date, required: true, default: moment().utc()},
        userAgent: String,
        ip: String,
        lastUsed: {type: Date, required: true, default: moment().utc()},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    });

    userAuthTokenSchema.methods.toString = function () {
        return this.user.toString();
    };

    userAuthTokenSchema.methods.hasExpired = function () {
        return (moment().utc().diff(this.createDate, 'days')) > expired_time;
    };

    userAuthTokenSchema.statics.generateNew = function (user, ip, userAgent) {
        var timestamp = moment().utc();
        var token = new UserAuthToken({
            auth_token: uuid.v1(),
            createDate: timestamp,
            userAgent: userAgent,
            ip: ip,
            lastUsed: timestamp,
            user: user
        });
        return token;
    };

    userAuthTokenSchema.statics.defaultPopulate = function () {
        return this.populate('user', 'username');
    };

    modelHelpers.deleteMongoFields(userAuthTokenSchema);
    var UserAuthToken = connection.model('UserAuthToken', userAuthTokenSchema);

    return UserAuthToken;
};
