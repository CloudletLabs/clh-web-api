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
    ensureNotExist: function (condition, done, callback) {
        helpers.exec(condition, done, function (count) {
            if (count > 0) {
                return done({status: 400, message: "Already exist"});
            }
            if (callback) {
                callback();
            } else {
                done(null, true);
            }
        });
    },
    save: function (obj, populateCondition, done, callback) {
        obj.save(function (err, result) {
            if (err) return done(err);
            if (!result) return done({status: 500, message: 'Saved result was null'});
            if (populateCondition) {
                helpers.populate(result, populateCondition, done, callback);
            } else if (callback) {
                callback(result)
            } else {
                done(null, result.toObject());
            }
        });
    },
    populate: function (obj, populateCondition, done, callback) {
        populateCondition.apply(obj).execPopulate().then(function (populated) {
            if (!populated) return done({status: 500, message: 'Populated result was null'});
            if (callback) {
                callback(populated);
            } else {
                done(null, populated.toObject());
            }
        }, function (err) {
            done(err);
        });
    },
    updateFields: function (condition, updated, populateCondition, done, callback) {
        helpers.exec(condition, done,
            function (original) {
                for (var attrname in updated) {
                    // TODO: Add extra fields, same as deletes in modelHelpers#deleteMongoFields
                    if (attrname != "_id" && attrname != "__v")
                        original[attrname] = updated[attrname];
                }

                helpers.save(original, populateCondition, done, callback);
            });
    },
    get: function (condition, populateCondition, done, callback) {
        if (populateCondition) {
            condition = populateCondition.apply(condition);
        }
        helpers.exec(condition, done, callback);
    },
    create: function (existenceCheckCondition, obj, populateCondition, done, callback) {
        helpers.ensureNotExist(existenceCheckCondition, done, function () {
            helpers.save(obj, populateCondition, done, callback);
        });
    },
    update: function (condition, keyFieldUpdateCondition, updated, populateCondition, done, callback) {
        if (keyFieldUpdateCondition) {
            helpers.ensureNotExist(keyFieldUpdateCondition, done, function () {
                helpers.updateFields(condition, updated, populateCondition, done, callback);
            });
        } else {
            helpers.updateFields(condition, updated, populateCondition, done, callback);
        }
    },
    remove: function (condition, done, callback) {
        condition.exec(function (err) {
            if (err) return done(err);
            if (callback) {
                callback();
            } else {
                done(null, {});
            }
        });
    }
};

module.exports = helpers;