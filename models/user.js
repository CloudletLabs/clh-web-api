var mongoose = require('mongoose');
var moment = require('moment');
var uuid = require('node-uuid');

module.exports = function (connection, deleteMongoFields) {

    var Schema = mongoose.Schema;

    var userSchema = new Schema({
        username: {type: String, index: true, unique: true, required: true, dropDups: true},
        password: {type: String, required: true},
        email: {type: String, required: true},
        tokens: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserAuthToken'}],
        name: {type: String, required: true},
        avatar: String,
        roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserRole'}]
    });

    deleteMongoFields(userSchema);

    userSchema.methods.tokenGenerate = function (ip, userAgent) {
        var token = {
            auth_token: uuid.v1(),
            createDate: moment().utc(),
            userAgent: userAgent,
            ip: ip,
            lastUsed: this.createDate
        };
        this.tokens.push(token);
        return token;
    };

    var User = connection.model('User', userSchema);

    return User;
};
