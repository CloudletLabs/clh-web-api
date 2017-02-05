'use strict';

let logger = {
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
        let logPrefix = origArgs[0];
        let msg = origArgs[1];
        let template = logPrefix;
        if (msg) template += " " + msg;
        let args = [template];
        if (origArgs.length > 2) {
            let extraArgs = Object.keys(origArgs).map(function(key){return origArgs[key].toString()});
            extraArgs = extraArgs.slice(2);
            args = args.concat(extraArgs);
        }
        console[level].apply(console, args);
    },
    logPrefixGenerator: function (req, res, next) {
        let prefix = `[${req.method}][${req.connection.remoteAddress}][${req.path}]`;
        if (req.user) {
            let user = req.user.user || req.user;
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