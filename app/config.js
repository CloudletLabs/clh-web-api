module.exports = {
    createApp: function(express) {
        return express();
    },
    morgan: function(app, morgan) {
        if (app.get('env') === 'development') {
            //noinspection JSUnusedGlobalSymbols
            var morganDevConfig = {
                skip: function (req, res) {
                    return res.statusCode < 400
                }
            };
            app.use(morgan('dev', morganDevConfig));
        } else {
            app.use(morgan('combined'));
        }
    },
    originHeaders: function (app) {
        app.use(function (req, res, next) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            if (req.method == "OPTIONS") {
                res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Authorization, Content-Type, Content-Length");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
                res.status(200).send();
                return;
            }
            next();
        });
    },
    parsingMiddleware: function (app, cookieParser, bodyParser) {
        // parse params in URL
        app.use(bodyParser.urlencoded({extended: false}));
        // Parse and populate cookies
        app.use(cookieParser());
    },
    routes: function (app, pJson, express, path, apiHandlers, v1Api, passport, models) {
        // Publish our public folder
        app.use(express.static(path.join(__dirname, '../public')));
        // API v1 router
        var v1 = v1Api(express, app, pJson, apiHandlers, passport, models);
        app.use('/api/v' + v1.apiVersion, v1.router);
        app.use('/api/v' + v1.apiVersion, apiHandlers.errorHandler);
        app.use('/api/current', v1.router);
        app.use('/api/current', apiHandlers.errorHandler);
    },
    errors: function (app) {
        app.use(function (req, res) {
            console.warn("[%s][%s] 404: %s", req.method, req.connection.remoteAddress, req.path);
            res.status(404).send();
        });
        app.use(function (err, req, res) {
            console.error("[%s][%s] ERROR: %s", req.method, req.connection.remoteAddress, err);
            res.status(err.status || 500).send();
        });
    }
};