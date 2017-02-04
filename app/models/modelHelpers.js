module.exports = {
    deleteMongoFields: function(schema, modelSpecificFields) {
        if (!schema.options.toObject) schema.options.toObject = {};
        schema.options.toObject.transform = function (doc, ret, options) {
            // remove the _id of every document before returning the result
            delete ret['_id'];
            delete ret['__v'];
            if (modelSpecificFields) {
                modelSpecificFields.forEach(function (field) {
                    delete ret[field];
                });
            }
            return ret;
        }
    },
    exec: function (condition, resultHandler, done) {
        condition.exec(function (err, result) {
            if (err) return done(err);
            resultHandler(result);
        });
    }
};