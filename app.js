/**
 * DB configuration and model
 * mongoose used as ORM for mongodb
 */
var mongoose = require('mongoose');
var db = require('./config/database')(mongoose);
var models = require('./models/models')(db);

/**
 * Express
 */
var express = require('express');
var app = express();

/**
 * Some additional modules
 */
var path = require('path');

/**
 * Middleware for logging in Express
 */
var morgan = require('morgan');
if (app.get('env') === 'development') {
    app.use(morgan('dev', {
        skip: function (req, res) {
            return res.statusCode < 400
        }
    }));
} else {
    app.use(morgan('combined'));
}

/**
 * Add Access-Control-Allow-Origin header
 */
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    console.info(req.method);
    if (req.method == "OPTIONS") {
        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Authorization, Content-Type, Content-Length");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.status(200).send();
        return;
    }
    next();
});

/**
 * Auth with passport
 */
var passport = require('passport');
require('./config/passport')(passport, models);

/**
 * Middleware for parsing requests
 */
var bodyParser = require('body-parser');
// parse json when application/json
app.use(bodyParser.json());
// parse params in URL
app.use(bodyParser.urlencoded({extended: false}));

/**
 * Parse and populate cookies
 */
var cookieParser = require('cookie-parser');
app.use(cookieParser());

/**
 * Publish our public folder
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * API v1 router
 */
require('./routes/api/v1/api')(app, passport, models);

/**
 * Catch 404 and forward to error handler
 */
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/**
 * Error handler
 */
app.use(function (err, req, res, next) {
    res.status(err.status || 500).send();
});

/**
 * Export example
 */
module.exports = app;
