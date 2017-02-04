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
            helpers.save(obj, defaultPopulate, done);
        }, done);
    },
    save: function (obj, defaultPopulate, done) {
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
    get: function (condition, defaultPopulate, done) {
        if (defaultPopulate) {
            condition = defaultPopulate.apply(condition);
        }
        helpers._exec(condition,
            function (result) {
                done(null, result.toObject());
            }, done);
    }
};

module.exports = helpers;