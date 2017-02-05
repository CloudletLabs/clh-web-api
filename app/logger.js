'use strict';

var logger = {
    logger: {
        info: function () {
            logger._log('info', arguments);
        },
        warn: function () {
            logger._log('warn', arguments);
        },
        error: function () {
            logger._log('error', arguments);
        }
    },
    _log: function (level, origArgs) {
        var logPrefix = origArgs[0];
        var msg = origArgs[1];
        var template = logPrefix;
        if (msg) template += " " + msg;
        var args = [template];
        if (origArgs.length > 2) {
            var extraArgs = Object.keys(origArgs).map(function(key){return origArgs[key].toString()});
            extraArgs = extraArgs.slice(2);
            args = args.concat(extraArgs);
        }
        console[level].apply(console, args);
    },
    logPrefixGenerator: function (req, res, next) {
        var prefix = `[${req.method}][${req.connection.remoteAddress}][${req.path}]`;
        if (req.user) {
            var user = req.user.user || req.user;
            prefix += `[${user.username}]`;
        }
        req.logPrefix = prefix;
        next();
    },
    reqLogger: function (req, res, next) {
        logger.logger.info(req.logPrefix);
        next();
    }
};

module.exports = logger;