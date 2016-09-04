var mongoose = require('mongoose');

module.exports = function (connection) {

    var Schema = mongoose.Schema;

    var userRoleSchema = new Schema({
        roleId: {type: String, index: true, unique: true, required: true, dropDups: true},
        displayName: {type: String, required: true}
    });

    var UserRole = connection.model('UserRole', userRoleSchema);

    return UserRole;
};
