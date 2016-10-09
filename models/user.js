var mongoose = require('mongoose');
var moment = require('moment');
var uuid = require('node-uuid');
var expired_time = 30;

module.exports = function (connection, deleteMongoFields) {

    var Schema = mongoose.Schema;

    var userSchema = new Schema({
        username: {type: String, index: true, unique: true, required: true, dropDups: true},
        password: {type: String, required: true},
        email: {type: String, required: true},
        token: {
            auth_token: String,
            createDate: {type: Date, required: true, default: moment().utc()}
        },
        name: {type: String, required: true},
        avatar: String,
        roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserRole'}]
    });

    deleteMongoFields(userSchema);

    userSchema.methods.hasExpired = function () {
        return (moment().utc().diff(this.token.createDate, 'days')) > expired_time;
    };

    userSchema.methods.tokenRegenerate = function () {
        this.token.auth_token = uuid.v1();
        this.token.createDate = moment().utc();
    };

    var User = connection.model('User', userSchema);

    return User;
};
