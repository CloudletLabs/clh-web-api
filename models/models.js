var moment = require('moment');

module.exports = function (connection) {

    function deleteMongoFields(schema) {
        if (!schema.options.toObject) schema.options.toObject = {};
        schema.options.toObject.transform = function (doc, ret, options) {
            // remove the _id of every document before returning the result
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }

    var User = require('./user')(connection, deleteMongoFields);
    var UserRole = require('./userRole')(connection, deleteMongoFields);
    var News = require('./news')(connection, deleteMongoFields);

    /**
     * Create some default test data
     */
    function createDefaultUserRoles() {
        UserRole.count(function (err, count) {
            if (err) {
                console.error(err);
                return;
            }
            if (count == 0) {
                console.warn('Found %s userRoles, creating default', count);
                [
                    {roleId: "ADMIN", displayName: "Administrator"},
                    {roleId: "USER", displayName: "User"}
                ].forEach(function (role, i, roles) {
                    result = this;
                    var newUserRole = new UserRole({
                        roleId: role.roleId,
                        displayName: role.displayName
                    });
                    newUserRole.save(function (err, userRole) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        result.push(userRole);
                        console.warn('New user role %s created', role.roleId);

                        if (i == (roles.length - 1)) {
                            createDefaultUsers(result);
                        }
                    });
                }, []);
            } else {
                UserRole.find(function (err, roles) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    createDefaultUsers(roles);
                })
            }
        });
    }

    function createDefaultUsers(roles) {
        User.count(function (err, count) {
            if (err) {
                console.error(err);
                return;
            }
            if (count == 0) {
                console.warn('Found %s users, creating default', count);
                var newUser = new User({
                    username: 'admin',
                    password: '28564878b1cbe4544ccfafaaa33b5326d8290e320e31c868f66de0128e73079b',
                    email: 'admin@example.com',
                    name: 'Admin',
                    avatar: 'img/mockUser.jpg',
                    roles: roles
                });
                newUser.save(function (err, user) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.warn('New user %s created', user.username);
                    createDefaultNews(user);
                });

                var anotherUser = new User({
                    username: 'user',
                    password: '720bb2073cb1961d26404ba1f5fe3f4d83b183bf72b8f7328c51f132b3c362db',
                    email: 'user@example.com',
                    name: 'User',
                    avatar: 'img/mockUser2.jpg',
                    roles: roles[1]
                });
                anotherUser.save(function (err, user) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.warn('New user %s created', user.username);
                });
            } else {
                User.find(function (err, users) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    createDefaultNews(users[0]);
                })
            }
        });
    }

    function createDefaultNews(user) {
        News.count(function (err, count) {
            if(count == 0) {
                console.warn('Found %s news, creating default', count);
                var newNews = new News({
                    slug: 'hello-world',
                    creator: user,
                    createDate: moment().utc().subtract(1, 'days'),
                    subject: 'Hello World!',
                    text: '**This** is a **first** test news! `Welcome!`'
                });
                newNews.save(function (err, news) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.warn('New news %s created', news.slug);
                });

                var anotherNews = new News({
                    slug: 'second-news',
                    creator: user,
                    subject: 'Second News',
                    text: 'This is a second test news!'
                });
                anotherNews.save(function (err, news) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.warn('New news %s created', news.slug);
                });
            }
        });
    }

    createDefaultUserRoles();

    /**
     * Return model entities
     */
    return {
        user: User,
        userRole: UserRole,
        news: News
    }
};