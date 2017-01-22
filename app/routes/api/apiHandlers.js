module.exports = {
    log: function (apiHandlers) {
        return {
            info: function () {
                apiHandlers._log('info', arguments);
            },
            warn: function () {
                apiHandlers._log('warn', arguments);
            },
            error: function () {
                apiHandlers._log('error', arguments);
            }
        }
    },
    _log: function (level, origArgs) {
        var req = origArgs[0];
        var args = [req.method, req.connection.remoteAddress, req.path];
        var template = '[%s][%s][%s]';
        if (req.user) {
            template += '[%s]';
            var user = req.user.user || req.user;
            args.push(user.username);
        }
        var msg = origArgs[1];
        if (msg) template += " " + msg;
        args.unshift(template);
        if (origArgs.length > 2) {
            var extraArgs = Object.keys(origArgs).map(function(key){return origArgs[key].toString()});
            extraArgs = extraArgs.slice(2);
            args = args.concat(extraArgs);
        }
        console[level].apply(console, args);
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