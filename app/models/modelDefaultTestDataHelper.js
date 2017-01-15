module.exports = {
    check: function (models) {
        helper = this;
        helper._check(helper, models.userRole, {}, helper._createDefaultUserRoles, function (results) {
            helper._check(helper, models.user, results, helper._createDefaultUsers, function (results) {
                helper._check(helper, models.news, results, helper._createDefaultNews, function (results) {
                    console.warn('Default test data has been created: %s',
                        Object.keys(results).map(function (currentValue) {
                            return currentValue + ':' + results[currentValue].length;
                        }));
                });
            });
        });
    },
    _getResultsName: function (name) {
        return name.replace(/\b\w/g, function (l) {
                return l.toLowerCase()
            }) + 's';
    },
    _check: function (helper, model, results, createDefaultCallback, next) {
        model.count(function (err, count) {
            if (err) throw (err);
            if (count <= 0) {
                var data = createDefaultCallback(results);
                helper._createDefaultData(helper, model, results, data, next);
            } else {
                helper._getExisting(helper, model, next);
            }
        });
    },
    _getExisting: function (helper, model, results, next) {
        model.find(function (err, result) {
            if (err) throw err;
            var modelName = helper._getResultsName(model.modelName);
            results[modelName] = result;
            next(results);
        });
    },
    _createDefaultData: function (helper, model, results, data, next) {
        var modelName = helper._getResultsName(model.modelName);
        console.warn('Creating default %s', modelName);
        results[modelName] = [];
        data.forEach(function (entry, i, entries) {
            var newEntry = new model(entry);
            newEntry.save(function (err, entry) {
                if (err) throw err;

                results[modelName].push(entry);
                console.warn('New %s %s created', model.modelName, entry);

                if (i == (entries.length - 1)) {
                    next(results);
                }
            });
        });
    },
    _createDefaultUserRoles: function (results) {
        return [
            {roleId: "ADMIN", displayName: "Administrator"},
            {roleId: "USER", displayName: "User"}
        ];
    },
    _createDefaultUsers: function (results) {
        return [
            {
                username: 'admin',
                password: '28564878b1cbe4544ccfafaaa33b5326d8290e320e31c868f66de0128e73079b',
                email: 'admin@example.com',
                name: 'Admin',
                avatar: 'img/mockUser.jpg',
                roles: results.userRoles
            },
            {
                username: 'user',
                password: '720bb2073cb1961d26404ba1f5fe3f4d83b183bf72b8f7328c51f132b3c362db',
                email: 'user@example.com',
                name: 'User',
                avatar: 'img/mockUser2.jpg',
                roles: [results.userRoles[1]]
            }
        ];
    },
    _createDefaultNews: function (results) {
        return [
            {
                slug: 'hello-world',
                creator: results.users[0],
                createDate: Date(2017, 1, 1, 0, 0, 0, 0),
                subject: 'Hello World!',
                text: '**This** is a **first** test news! `Welcome!`'
            },
            {
                slug: 'second-news',
                creator: results.users[0],
                createDate: Date(2017, 1, 2, 0, 0, 0, 0),
                subject: 'Second News',
                text: 'This is a second test news!'
            }
        ];
    }
};