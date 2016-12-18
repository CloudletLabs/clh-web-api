var mongoose = require('mongoose');

module.exports = function (connection, deleteMongoFields) {

    var Schema = mongoose.Schema;

    var userSchema = new Schema({
        username: {type: String, index: true, unique: true, required: true, dropDups: true},
        password: {type: String, required: true},
        email: {type: String, required: true},
        name: {type: String, required: true},
        avatar: String,
        roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserRole'}]
    });

    deleteMongoFields(userSchema, ['password']);

    var User = connection.model('User', userSchema);

    return User;
};
