'use strict';

module.exports = function (logger, models, controllerHelpers) {

    let User = models.user;
    let UserRole = models.userRole;

    return {
        populateFromToken: function (token, done) {
            controllerHelpers.populate(token, token.populate('user'), done, function (token) {
                controllerHelpers.populate(token.user, User.defaultPopulate, done);
            });
        },
        getAll: function (done) {
            controllerHelpers.get(User.find(), User.defaultPopulate, done);
        },
        create: function (user, done) {
            controllerHelpers.get(UserRole.findOne({roleId: 'USER'}), null, done, function (userRole) {
                let newUser = User.generateNew(
                    user.username, user.password, user.email, user.name, 'img/mockUser2.jpg', userRole);
                controllerHelpers.create(User.count({username: user.username}), newUser, User.defaultPopulate, done);
            });
        },
        get: function (username, done) {
            controllerHelpers.get(User.findOne({username: username}), User.defaultPopulate, done);
        },
        update: function (username, updatedUser, done) {
            controllerHelpers.update(User.findOne({username: username}),
                (updatedUser.username && username != updatedUser.username) ? User.count({username: updatedUser.username}) : null,
                updatedUser, User.defaultPopulate, done);
        },
        remove: function (username, done) {
            controllerHelpers.remove(User.findOneAndRemove({username: username}).exec(), done);
        }
    }
};