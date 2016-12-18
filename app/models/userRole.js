module.exports = function (connection, mongoose, deleteMongoFields) {

    var Schema = mongoose.Schema;

    var userRoleSchema = new Schema({
        roleId: {type: String, index: true, unique: true, required: true, dropDups: true},
        displayName: {type: String, required: true}
    });

    deleteMongoFields(userRoleSchema);

    var UserRole = connection.model('UserRole', userRoleSchema);

    return UserRole;
};
