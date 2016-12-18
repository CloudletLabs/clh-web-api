module.exports = {
    log: function (req, msg, args) {
        var user;
        if (req.user) {
            user = req.user.user || req.user;
        }
        var arr = [req.method, req.connection.remoteAddress, req.path];
        var template;
        if (!user) {
            template = "[%s][%s][%s]";
        } else {
            template = "[%s][%s][%s][%s]";
            arr.push(user.username);
        }
        if (msg) template += " " + msg;
        arr.unshift(template);
        if (args) arr = arr.concat(args);
        console.info.apply(console, arr);
    },
    errorHandler: function (err, req, res) {
        console.error("[%s][%s] API ERROR: %s", req.method, req.connection.remoteAddress, err);
        res.status(err.status || 500);
        delete err.status;
        if (err.length === 0) {
            res.send();
        } else {
            res.json(err);
        }
    },
    status: function (log) {
        return function (req, res, next) {
            log(req);
            res.send('ok');
        }
    },
    info: function (pJson, apiVersion, log) {
        return function (req, res, next) {
            log(req);
            res.json({name: pJson.name, version: pJson.version, apiVersion: apiVersion});
        }
    }
};