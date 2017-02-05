module.exports = function (modelHelpers, connection, mongoose) {

    var Schema = mongoose.Schema;

    var userSchema = new Schema({
        username: {type: String, index: true, unique: true, required: true, dropDups: true},
        password: {type: String, required: true},
        email: {type: String, required: true},
        name: {type: String, required: true},
        avatar: String,
        roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'UserRole'}]
    });

    userSchema.methods.toString = function () {
        return this.username;
    };

    userSchema.statics.generateNew = function (username, password, email, name, avatar, defaultRole) {
        var token = new User({
            username: username,
            password: password,
            email: email,
            name: name,
            avatar: avatar,
            roles: [defaultRole]
        });
        return token;
    };

    userSchema.statics.defaultPopulate = function () {
        return this.populate('roles', 'roleId');
    };

    modelHelpers.deleteMongoFields(userSchema, ['password']);

    var User = connection.model('User', userSchema);

    return User;
};
