module.exports = {
    notFoundHandler: function (req, res) {
        console.warn('[%s][%s] 404: %s', req.method, req.connection.remoteAddress, req.path);
        res.status(404);
        res.json({message: 'Not found'});
    },
    errorHandler: function (err, req, res, next) {
        var status = err.status || 500;
        var message = err.message || 'Unknown API error';
        console.error('[%s][%s] API ERROR %s: %s', req.method, req.connection.remoteAddress, status, message);
        res.status(status);
        res.json({message: message});
    },
    status: function (api) {
        return function (req, res, next) {
            res.send(api.pJson.name + ': ok');
        }
    },
    info: function (api) {
        return function (req, res, next) {
            res.json({name: api.pJson.name, version: api.pJson.version, apiVersion: api.apiVersion});
        }
    },
    sendRes: function (res, next) {
        return function (err, result) {
            if (err) return next(err);
            res.json(result);
        }
    }
};