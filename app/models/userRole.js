'use strict';

module.exports = function (modelHelpers, connection, mongoose) {

    let Schema = mongoose.Schema;

    let userRoleSchema = new Schema({
        roleId: {type: String, index: true, unique: true, required: true, dropDups: true},
        displayName: {type: String, required: true}
    });

    userRoleSchema.methods.toString = function () {
        return this.roleId;
    };

    modelHelpers.deleteMongoFields(userRoleSchema);

    return connection.model('UserRole', userRoleSchema);
};
