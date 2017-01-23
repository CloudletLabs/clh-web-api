module.exports = {
    log: function () {
        var logger = this;
        return {
            info: function () {
                logger._log('info', arguments);
            },
            warn: function () {
                logger._log('warn', arguments);
            },
            error: function () {
                logger._log('error', arguments);
            }
        }
    },
    _log: function (level, origArgs) {
        var id = origArgs[0];
        var msg = origArgs[1];
        var template = id;
        if (msg) template += " " + msg;
        var args = [template];
        if (origArgs.length > 2) {
            var extraArgs = Object.keys(origArgs).map(function(key){return origArgs[key].toString()});
            extraArgs = extraArgs.slice(2);
            args = args.concat(extraArgs);
        }
        console[level].apply(console, args);
    }
};