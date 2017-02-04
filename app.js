module.exports = function (require) {
    /**
     * App configurator
     */
    var pJson = require('../package.json');
    var appConfig = require('../app/config');
    var loggerModule = require('../app/logger');
    var logger = loggerModule.log();

    /**
     * Some additional modules
     */
    var path = require('path');
    var moment = require('moment');
    var uuid = require('node-uuid');

    /**
     * DB configuration and model
     * mongoose used as ORM for mongodb
     */
    var mongoose = require('mongoose');
    var connection = require('../app/config/database')(mongoose);
    var modelHelpers = require('../app/models/modelHelpers');
    var models = require('../app/models/models')(require, modelHelpers, connection, mongoose, moment, uuid);
    var modelDefaultTestDataHelper = require('../app/models/modelDefaultTestDataHelper');
    modelDefaultTestDataHelper.check(models, moment);

    /**
     * Controllers
     */
    var controllers = require('../app/controllers/controllers')(require, logger, models, modelHelpers);

    /**
     * Express
     */
    var express = require('express');
    var app = appConfig.createApp(express);

    /**
     * Middleware for logging in Express
     */
    var morgan = require('morgan');
    appConfig.morgan(app, morgan);

    /**
     * Add Access-Control-Allow-Origin header
     */
    appConfig.originHeaders(app);

    /**
     * Auth with passport
     */
    var passport = require('passport');
    var BasicStrategy = require('passport-http').BasicStrategy;
    var BearerStrategy = require('passport-http-bearer').Strategy;
    var passportHelpers = require('../app/config/passportHelpers');
    require('../app/config/passport')(passport, passportHelpers, models, moment, BasicStrategy, BearerStrategy);

    /**
     * Middleware for parsing requests
     */
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    appConfig.parsingMiddleware(app, cookieParser, bodyParser);

    /**
     * Logging middleware
     */
    appConfig.loggingMiddleware(app, loggerModule);

    /**
     * Routes
     */
    var apiHandlers = require('../app/routes/api/apiHandlers');
    var v1Api = require('../app/routes/api/v1/api');
    appConfig.routes(app, pJson, express, path, logger, apiHandlers, v1Api, passport, controllers);

    /**
     * Catch errors
     */
    appConfig.errors(app);

    /**
     * Export app
     */
    return app;
};
