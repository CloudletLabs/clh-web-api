module.exports = function (connection, mongoose, moment, uuid, expired_time, deleteMongoFields) {

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

    userAuthTokenSchema.statics.tokenGenerate = function (user, ip, userAgent, done) {
        var timestamp = moment().utc();
        var token = new UserAuthToken({
            auth_token: uuid.v1(),
            createDate: timestamp,
            userAgent: userAgent,
            ip: ip,
            lastUsed: timestamp,
            user: user
        });
        token.save(function (err, token) {
            done(err, token);
        });
    };

    var UserAuthToken = connection.model('UserAuthToken', userAuthTokenSchema);

    return UserAuthToken;
};
