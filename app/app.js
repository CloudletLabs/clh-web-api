'use strict';

/**
 * Express
 */
let express = require('express');

/**
 * App configurator
 */
let pJson = require('../package.json');
let appConfig = require('./config');
let loggerModule = require('./logger');
let logger = loggerModule.logger;
let app = appConfig.createApp(express);

/**
 * Some additional modules
 */
let path = require('path');
let moment = require('moment/moment');
let uuid = require('uuid');

/**
 * DB configuration and model
 * mongoose used as ORM for mongodb
 */
let mongoose = require('mongoose');
let connection = require('./config/database')(mongoose);
let modelHelpers = require('./models/modelHelpers');
let models = require('./models/models')(modelHelpers, connection, mongoose, moment, uuid);
let modelDefaultTestDataHelper = require('./models/modelDefaultTestDataHelper');
modelDefaultTestDataHelper.check(models);

/**
 * Controllers
 */
let controllerHelpers = require('./controllers/controllerHelpers');
let controllers = require('./controllers/controllers')(logger, models, controllerHelpers);

/**
 * Middleware for logging in Express
 */
let morgan = require('morgan');
appConfig.morgan(app, morgan);

/**
 * Add Access-Control-Allow-Origin header
 */
appConfig.originHeaders(app);

/**
 * We want to expose outside all the Date objects as a Unix-time
 */
appConfig.dates(app);

/**
 * Auth with passport
 */
let passport = require('passport');
let BasicStrategy = require('passport-http').BasicStrategy;
let BearerStrategy = require('passport-http-bearer').Strategy;
let passportHelpers = require('./config/passportHelpers');
require('./config/passport')(passport, passportHelpers, models, moment, BasicStrategy, BearerStrategy);

/**
 * Middleware for parsing requests
 */
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
appConfig.parsingMiddleware(app, cookieParser, bodyParser);

/**
 * Logging middleware
 */
appConfig.loggingMiddleware(app, loggerModule);

/**
 * Routes
 */
let apiHandlers = require('./routes/api/apiHandlers');
let v1Api = require('./routes/api/v1/api');
appConfig.routes(app, pJson, express, path, logger, apiHandlers, v1Api, passport, controllers);

/**
 * Catch errors
 */
appConfig.errors(app);

/**
 * Export app
 */
module.exports = app;