var helpers = {
    _exec: function (condition, resultHandler, done) {
        condition.exec(function (err, result) {
            if (err) return done(err);
            if (result === null || result === undefined) return done();
            resultHandler(result);
        });
    },
    _ensureNotExist: function (condition, callback, done) {
        helpers._exec(condition, function (count) {
            if (count > 0) {
                return done({status: 400, message: "Already exist"});
            }
            callback();
        }, done);
    },
    _save: function (obj, defaultPopulate, done) {
        obj.save(function (err, result) {
            if (err) return done(err);
            if (!result) return done({status: 500, message: 'Saved result was null'});
            if (defaultPopulate) {
                defaultPopulate.apply(result).execPopulate().then(function (populated) {
                    if (!populated) return done({status: 500, message: 'Populated result was null'});
                    done(null, populated.toObject());
                }, function (err) {
                    done(err);
                });
            } else {
                done(null, result.toObject());
            }
        });
    },
    _updateFields: function (condition, updated, defaultPopulate, done) {
        helpers._exec(condition,
            function (original) {
                for (var attrname in updated) {
                    // TODO: Add extra fields, same as deletes in modelHelpers#deleteMongoFields
                    if (attrname != "_id" && attrname != "__v")
                        original[attrname] = updated[attrname];
                }

                helpers._save(original, defaultPopulate, done);
            }, done);
    },
    getAll: function (condition, defaultPopulate, done) {
        if (defaultPopulate) {
            condition = defaultPopulate.apply(condition);
        }
        helpers._exec(condition,
            function (result) {
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
        if (defaultPopulate) {
            condition = defaultPopulate.apply(condition);
        }
        helpers._exec(condition,
            function (result) {
                done(null, result.toObject());
            }, done);
    },
    update: function (condition, keyFieldUpdateCondition, updated, defaultPopulate, done) {
        if (keyFieldUpdateCondition) {
            helpers._exec(keyFieldUpdateCondition,
                function (count) {
                    if (count > 0) {
                        return done({status: 400, message: "Conflicting with already existing"});
                    }
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