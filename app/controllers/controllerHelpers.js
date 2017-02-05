var helpers = {
    exec: function (condition, done, callback) {
        condition.exec(function (err, result) {
            if (err) return done(err);
            if (result === null || result === undefined) return done();
            if (callback) {
                callback(result);
            } else {
                if (Array.isArray(result)) {
                    done(null, result.map(function (entry) {
                        return entry.toObject();
                    }));
                } else {
                    done(null, result.toObject());
                }
            }
        });
    },
    _ensureNotExist: function (condition, callback, done) {
        helpers.exec(condition, done, function (count) {
            if (count > 0) {
                return done({status: 400, message: "Already exist"});
            }
            callback();
        });
    },
    _save: function (obj, defaultPopulate, done) {
        obj.save(function (err, result) {
            if (err) return done(err);
            if (!result) return done({status: 500, message: 'Saved result was null'});
            if (defaultPopulate) {
                helpers._populate(result, defaultPopulate, done);
            } else {
                done(null, result.toObject());
            }
        });
    },
    _populate: function (obj, defaultPopulate, done) {
        defaultPopulate.apply(obj).execPopulate().then(function (populated) {
            if (!populated) return done({status: 500, message: 'Populated result was null'});
            done(null, populated.toObject());
        }, function (err) {
            done(err);
        });
    },
    _updateFields: function (condition, updated, defaultPopulate, done) {
        helpers.exec(condition, done,
            function (original) {
                for (var attrname in updated) {
                    // TODO: Add extra fields, same as deletes in modelHelpers#deleteMongoFields
                    if (attrname != "_id" && attrname != "__v")
                        original[attrname] = updated[attrname];
                }

                helpers._save(original, defaultPopulate, done);
            });
    },
    _get: function (condition, defaultPopulate, resultHandler, done) {
        if (defaultPopulate) {
            condition = defaultPopulate.apply(condition);
        }
        helpers.exec(condition, done,
            function (result) {
                resultHandler(result);
            });
    },
    getAll: function (condition, defaultPopulate, done) {
        helpers._get(condition, defaultPopulate, function (result) {
            done(null, result.map(function (entry) {
                return entry.toObject();
            }));
        }, done);
    },
    create: function (existenceCheckCondition, obj, defaultPopulate, done) {
        helpers._ensureNotExist(existenceCheckCondition, function () {
            helpers._save(obj, defaultPopulate, done);
        }, done);
    },
    get: function (condition, defaultPopulate, done) {
        helpers._get(condition, defaultPopulate, function (result) {
            done(null, result.toObject());
        }, done);
    },
    update: function (condition, keyFieldUpdateCondition, updated, defaultPopulate, done) {
        if (keyFieldUpdateCondition) {
            helpers._ensureNotExist(keyFieldUpdateCondition, function () {
                helpers._updateFields(condition, updated, defaultPopulate, done);
            }, done);
        } else {
            helpers._updateFields(condition, updated, defaultPopulate, done);
        }
    },
    remove: function (condition, done) {
        condition.exec(function (err) {
            if (err) return done(err);
            done(null, {});
        });
    }
};

module.exports = helpers;