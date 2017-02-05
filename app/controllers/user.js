module.exports = function (logger, models, controllerHelpers) {

    var User = models.user;

    var userRole;
    models.userRole.findOne({roleId: 'USER'}, function (err, role) {
        if (err) throw err;
        if (!role) throw new Error('Default USER role not found');
        userRole = role;
    });

    return {
        populateFromToken: function (token, done) {
            token.populate('user', function (err, token) {
                if (err) return done(err);
                controllerHelpers._populate(token.user, User.defaultPopulate, done);
            });
        },
        getAll: function (done) {
            controllerHelpers.getAll(User.find(), User.defaultPopulate, done);
        },
        create: function (user, done) {
            var newUser = new User(user);
            newUser.avatar = 'img/mockUser2.jpg';
            newUser.roles = [];
            newUser.roles.push(userRole);
            controllerHelpers.create(User.count({username: user.username}), newUser, User.defaultPopulate, done);
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
            controllerHelpers.remove(User.findOneAndRemove({username: username}), done);
        }
    }
};