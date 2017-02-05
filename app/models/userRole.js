'use strict';

module.exports = function (modelHelpers, connection, mongoose) {

    var Schema = mongoose.Schema;

    var userRoleSchema = new Schema({
        roleId: {type: String, index: true, unique: true, required: true, dropDups: true},
        displayName: {type: String, required: true}
    });

    userRoleSchema.methods.toString = function () {
        return this.roleId;
    };

    modelHelpers.deleteMongoFields(userRoleSchema);

    var UserRole = connection.model('UserRole', userRoleSchema);

    return UserRole;
};
