module.exports = {
    generateRequestId: function (req) {
        var reqId = `[${req.method}][${req.connection.remoteAddress}][${req.path}]`;
        if (req.user) {
            var user = req.user.user || req.user;
            reqId += `[${user.username}]`;
        }
        return reqId;
    },
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
            api.log.info(req);
            res.send('ok');
        }
    },
    info: function (api) {
        return function (req, res, next) {
            api.log.info(req);
            res.json({name: api.pJson.name, version: api.pJson.version, apiVersion: api.apiVersion});
        }
    }
};