'use strict';

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var appConfig = require('../../app/config');

describe('The config module', function() {
    it('should have functions', sinon.test(function () {
        expect(Object.keys(appConfig).length).to.be.equal(7);
        expect(appConfig.createApp).to.be.a('function');
        expect(appConfig.morgan).to.be.a('function');
        expect(appConfig.originHeaders).to.be.a('function');
        expect(appConfig.parsingMiddleware).to.be.a('function');
        expect(appConfig.loggingMiddleware).to.be.a('function');
        expect(appConfig.routes).to.be.a('function');
        expect(appConfig.errors).to.be.a('function');
    }));

    it('should create app', sinon.test(function () {
        var expressMock = this.stub();
        var appMock = this.stub();
        expressMock.returns(appMock);

        var app = appConfig.createApp(expressMock);

        expect(app).to.be.equal(appMock);
    }));

    it('should configure morgan for dev', sinon.test(function () {
        var appMock = this.stub();
        appMock.get = this.stub();
        appMock.get.withArgs('env').returns('development');
        appMock.use = this.stub();
        var morganMock = this.stub();
        var config;
        var morganFunctionSpy = this.spy();
        var morganFunctionMock = function (env, actualConfig) {
            morganFunctionSpy(env, actualConfig);
            config = actualConfig;
            return morganMock;
        };

        appConfig.morgan(appMock, morganFunctionMock);

        expect(appMock.get).to.have.been.calledWithExactly('env');
        expect(appMock.use).to.have.been.calledWithExactly(morganMock);
        expect(morganFunctionSpy).to.have.been.calledWithExactly('dev', config);
        expect(config.skip).to.be.a('function');
        expect(config.skip(null, { statusCode: 399 })).to.be.true;
        expect(config.skip(null, { statusCode: 400 })).to.be.false;
    }));

    it('should configure morgan for non dev', sinon.test(function () {
        var appMock = this.stub();
        appMock.get = this.stub();
        appMock.get.withArgs('env').returns('foo');
        appMock.use = this.stub();
        var morganMock = this.stub();
        var morganFunctionMock = this.stub();
        morganFunctionMock.returns(morganMock);

        appConfig.morgan(appMock, morganFunctionMock);

        expect(appMock.get).to.have.been.calledWithExactly('env');
        expect(appMock.use).to.have.been.calledWithExactly(morganMock);
        expect(morganFunctionMock).to.have.been.calledWithExactly('combined');
    }));

    it('should configure origin headers for OPTIONS request', sinon.test(function () {
        var appMock = this.stub();

        var appMockUseSpy = this.spy();
        var thisSinon = this;
        appMock.use = function (configurator) {
            appMockUseSpy();

            var reqMock = thisSinon.stub();
            reqMock.method = 'OPTIONS';
            var resMock = thisSinon.stub();
            resMock.setHeader = thisSinon.spy();
            resMock.status = thisSinon.stub();
            resMock.status.returns(resMock);
            resMock.send = thisSinon.spy();
            var nextMock = thisSinon.spy();

            configurator(reqMock, resMock, nextMock);

            expect(resMock.setHeader).to.have.been.calledWithExactly('Access-Control-Allow-Origin', '*');
            expect(resMock.setHeader).to.have.been.calledWithExactly('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, Content-Type, Content-Length');
            expect(resMock.setHeader).to.have.been.calledWithExactly('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            expect(resMock.status).to.have.been.calledWithExactly(200);
            expect(resMock.send).to.have.been.called;
            expect(nextMock).to.not.have.been.called;
        };

        appConfig.originHeaders(appMock);

        expect(appMockUseSpy).to.have.been.called;
    }));

    it('should configure origin headers for non-OPTIONS requests', sinon.test(function () {
        var appMock = this.stub();

        var appMockUseSpy = this.spy();
        var thisSinon = this;
        appMock.use = function (configurator) {
            appMockUseSpy();

            var reqMock = thisSinon.stub();
            reqMock.method = 'foo';
            var resMock = thisSinon.stub();
            resMock.setHeader = thisSinon.spy();
            var nextMock = thisSinon.spy();

            configurator(reqMock, resMock, nextMock);

            expect(resMock.setHeader).to.have.been.calledWithExactly('Access-Control-Allow-Origin', '*');
            expect(nextMock).to.have.been.called;
        };

        appConfig.originHeaders(appMock);

        expect(appMockUseSpy).to.have.been.called;
    }));

    it('should configure parsing middleware', sinon.test(function () {
        var appMock = this.stub();
        appMock.use = this.stub();
        var cookieParserFunctionMock = this.stub();
        var cookieParserMock = this.stub();
        cookieParserFunctionMock.returns(cookieParserMock);
        var bodyParserMock = this.stub();
        bodyParserMock.json = this.stub();
        var bodyParserJsonMock = this.stub();
        bodyParserMock.json.returns(bodyParserJsonMock);
        bodyParserMock.urlencoded = this.stub();
        var bodyParserUrlEncodedMock = this.stub();
        bodyParserMock.urlencoded.returns(bodyParserUrlEncodedMock);

        appConfig.parsingMiddleware(appMock, cookieParserFunctionMock, bodyParserMock);

        expect(appMock.use).to.have.been.calledWithExactly(bodyParserJsonMock);
        expect(appMock.use).to.have.been.calledWithExactly(bodyParserUrlEncodedMock);
        expect(bodyParserMock.json).to.have.been.calledWithExactly();
        expect(bodyParserMock.urlencoded).to.have.been.calledWithExactly({extended: false});
        expect(appMock.use).to.have.been.calledWithExactly(cookieParserMock);
        expect(cookieParserFunctionMock).to.have.been.called;
    }));

    it('should configure logging middleware', sinon.test(function () {
        var appMock = this.stub();
        appMock.use = this.stub();
        var loggerModuleMock = this.stub();
        loggerModuleMock.logPrefixGenerator = this.stub();
        loggerModuleMock.reqLogger = this.stub();

        appConfig.loggingMiddleware(appMock, loggerModuleMock);

        expect(appMock.use).to.have.been.calledWithExactly(loggerModuleMock.logPrefixGenerator);
        expect(appMock.use).to.have.been.calledWithExactly(loggerModuleMock.reqLogger);
    }));

    it('should configure routes', sinon.test(function () {
        var appMock = this.stub();
        appMock.use = this.stub();

        var pJsonMock = this.stub();

        var expressMock = this.stub();
        expressMock.static = this.stub();
        expressMock.static.returns('test static');

        var pathMock = this.stub();
        pathMock.join = this.stub();
        pathMock.join.returns('test path');

        var loggerMock = this.stub();

        var apiHandlersMock = this.stub();
        apiHandlersMock.notFoundHandler = this.stub();
        apiHandlersMock.errorHandler = this.stub();
        apiHandlersMock.status = this.stub();
        apiHandlersMock.status.returns(apiHandlersMock.status);
        apiHandlersMock.info = this.stub();
        apiHandlersMock.info.returns(apiHandlersMock.info);

        var v1ApiMock = this.stub();
        v1ApiMock.apiVersion = '1';
        v1ApiMock.pJson = pJsonMock;
        v1ApiMock.router = this.stub();
        v1ApiMock.router.get = this.stub();
        v1ApiMock.log = this.stub();
        v1ApiMock.returns(v1ApiMock);

        var passportMock = this.stub();
        var controllersMock = this.stub();

        appConfig.routes(appMock, pJsonMock, expressMock, pathMock, loggerMock,
            apiHandlersMock, v1ApiMock, passportMock, controllersMock);

        expect(pathMock.join).to.have.been.calledWithExactly(sinon.match.string, '../public');
        expect(expressMock.static).to.have.been.calledWithExactly('test path');
        expect(appMock.use).to.have.been.calledWithExactly('test static');
        expect(v1ApiMock).to.have.been.calledWithExactly(
            expressMock, appMock, pJsonMock, loggerMock, apiHandlersMock, passportMock, controllersMock);
        expect(apiHandlersMock.status).to.have.been.calledWithExactly(v1ApiMock);
        expect(v1ApiMock.router.get).to.have.been.calledWithExactly('/status', apiHandlersMock.status);
        expect(v1ApiMock.router.get).to.have.been.calledWithExactly('/info', apiHandlersMock.info);
        expect(appMock.use).to.have.been.calledWithExactly('/api/v1', v1ApiMock.router);
        expect(appMock.use).to.have.been.calledWithExactly('/api/v1', apiHandlersMock.notFoundHandler);
        expect(appMock.use).to.have.been.calledWithExactly('/api/v1', apiHandlersMock.errorHandler);
        expect(appMock.use).to.have.been.calledWithExactly('/api/current', v1ApiMock.router);
        expect(appMock.use).to.have.been.calledWithExactly('/api/current', apiHandlersMock.notFoundHandler);
        expect(appMock.use).to.have.been.calledWithExactly('/api/current', apiHandlersMock.errorHandler);
    }));

    it('should configure error handlers', sinon.test(function () {
        var appMock = this.stub();
        var appUseSpy = this.spy();
        var handlers = [];
        appMock.use = function (handler) {
            appUseSpy();
            handlers.push(handler);
        };
        var reqMock = {};
        reqMock.method = 'test method';
        reqMock.connection = {};
        reqMock.connection.remoteAddress = 'test address';
        reqMock.path = 'test path';
        var resMock = this.stub();
        resMock.status = this.stub();
        resMock.status.returns(resMock);
        resMock.send = this.stub();

        var consoleWarnMock = this.stub(console, 'warn');
        var consoleErrorMock = this.stub(console, 'error');

        appConfig.errors(appMock);

        expect(appUseSpy).to.have.been.calledTwice;
        expect(handlers.length).to.be.equal(2);

        handlers[0](reqMock, resMock);
        expect(consoleWarnMock).to.have.been.calledWithExactly('[%s][%s] 404: %s', 'test method', 'test address', 'test path');
        expect(resMock.status).to.have.been.calledWithExactly(404);
        expect(resMock.send).to.have.been.called;

        handlers[1]({}, reqMock, resMock);
        expect(consoleErrorMock).to.have.been.calledWithExactly('[%s][%s] ERROR: %s', 'test method', 'test address', {});
        expect(resMock.status).to.have.been.calledWithExactly(500);
        expect(resMock.send).to.have.been.called;

        handlers[1]({ status: 199 }, reqMock, resMock);
        expect(consoleErrorMock).to.have.been.calledWithExactly('[%s][%s] ERROR: %s', 'test method', 'test address', { status: 199 });
        expect(resMock.status).to.have.been.calledWithExactly(199);
        expect(resMock.send).to.have.been.called;
    }));
});