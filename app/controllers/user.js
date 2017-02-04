module.exports = function (logger, models) {

    var UserRole = models.userRole;
    var User = models.user;

    return {
        populateFromToken: function (token, done) {
            token.populate("user", function (err, token) {
                if (err) return done(err);

                token.user.populate("roles", "roleId", function (err, user) {
                    if (err) return done(err);
                    done(null, user.toObject());
                });
            });
        },
        getAll: function (done) {
            User.find().populate("roles", "roleId").exec(function (err, users) {
                if (err) return done(err);
                done(null, users.map(function (user) {
                    return user.toObject();
                }));
            });
        },
        create: function (user, done) {
            User.count({username: user.username}, function (err, count) {
                if (err) return done(err);

                if (count > 0) {
                    return done({status: 400, message: "User already exist"});
                }

                UserRole.findOne({roleId: 'USER'}, function (err, role) {
                    if (err) return done(err);

                    var newUser = new User(user);
                    newUser.avatar = 'img/mockUser2.jpg';
                    newUser.roles.push(role);
                    newUser.save(function (err, user) {
                        if (err) return done(err);

                        user.populate("roles", "roleId", function (err, user) {
                            if (err) return done(err);
                            done(null, user.toObject());
                        });
                    });
                });
            });
        },
        get: function (username, done) {
            User.findOne({username: username}).populate("roles", "roleId").exec(function (err, user) {
                if (err) return done(err);

                if (!user) {
                    return done({status: 404, message: "User not found"});
                }

                done(null, user.toObject());
            });
        },
        update: function (username, updatedUser, done) {
            User.findOne({username: username}).populate("roles", "roleId").exec(function (err, user) {
                if (err) return done(err);

                if (!user) {
                    return done({status: 404, message: "User not found"});
                }

                for (var attrname in updatedUser) {
                    if (attrname != "_id" && attrname != "__v")
                        user[attrname] = updatedUser[attrname];
                }

                user.save(function (err, user) {
                    if (err) return done(err);
                    done(null, user.toObject());
                });
            });
        },
        remove: function (username, done) {
            User.findOneAndRemove({username: username}, function (err) {
                if (err) return done(err);
                done();
            });
        }
    }
};