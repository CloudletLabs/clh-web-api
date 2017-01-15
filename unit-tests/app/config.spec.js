var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var appConfig = require('../../app/config');

describe('The config module', function() {
    it('should have functions', sinon.test(function () {
        expect(Object.keys(appConfig).length).to.be.equal(6);
        expect(appConfig.createApp).to.be.a('function');
        expect(appConfig.morgan).to.be.a('function');
        expect(appConfig.originHeaders).to.be.a('function');
        expect(appConfig.parsingMiddleware).to.be.a('function');
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

        expect(appMock.get).to.have.been.calledWith('env');
        expect(appMock.use).to.have.been.calledWith(morganMock);
        expect(morganFunctionSpy).to.have.been.calledWith('dev', config);
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

        expect(appMock.get).to.have.been.calledWith('env');
        expect(appMock.use).to.have.been.calledWith(morganMock);
        expect(morganFunctionMock).to.have.been.calledWith('combined');
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

            expect(resMock.setHeader).to.have.been.calledWith('Access-Control-Allow-Origin', '*');
            expect(resMock.setHeader).to.have.been.calledWith('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, Content-Type, Content-Length');
            expect(resMock.setHeader).to.have.been.calledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            expect(resMock.status).to.have.been.calledWith(200);
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

            expect(resMock.setHeader).to.have.been.calledWith('Access-Control-Allow-Origin', '*');
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
        bodyParserMock.urlencoded = this.stub();
        var bodyParserUrlEncodedMock = this.stub();
        bodyParserMock.urlencoded.returns(bodyParserUrlEncodedMock);

        appConfig.parsingMiddleware(appMock, cookieParserFunctionMock, bodyParserMock);

        expect(appMock.use).to.have.been.calledWith(bodyParserUrlEncodedMock);
        expect(bodyParserMock.urlencoded).to.have.been.calledWith({extended: false});
        expect(appMock.use).to.have.been.calledWith(cookieParserMock);
        expect(cookieParserFunctionMock).to.have.been.called;
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
        var apiHandlersMock = this.stub();
        var errorHandlerMock = this.stub();
        apiHandlersMock.errorHandler = errorHandlerMock;
        var v1ApiMock = this.stub();
        var v1ApiRouter = this.stub();
        v1ApiMock.returns({apiVersion: 1, router: v1ApiRouter});
        var passportMock = this.stub();
        var modelsMock = this.stub();

        appConfig.routes(appMock, pJsonMock, expressMock, pathMock, apiHandlersMock, v1ApiMock, passportMock, modelsMock);

        expect(pathMock.join).to.have.been.calledWith(sinon.match.string, '../public');
        expect(expressMock.static).to.have.been.calledWith('test path');
        expect(appMock.use).to.have.been.calledWith('test static');
        expect(v1ApiMock).to.have.been.calledWith(expressMock, appMock, pJsonMock, apiHandlersMock, passportMock, modelsMock);
        expect(appMock.use).to.have.been.calledWith('/api/v1', v1ApiRouter);
        expect(appMock.use).to.have.been.calledWith('/api/v1', errorHandlerMock);
        expect(appMock.use).to.have.been.calledWith('/api/current', v1ApiRouter);
        expect(appMock.use).to.have.been.calledWith('/api/current', errorHandlerMock);
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
        expect(consoleWarnMock).to.have.been.calledWith('[%s][%s] 404: %s', 'test method', 'test address', 'test path');
        expect(resMock.status).to.have.been.calledWith(404);
        expect(resMock.send).to.have.been.called;

        handlers[1]({}, reqMock, resMock);
        expect(consoleErrorMock).to.have.been.calledWith('[%s][%s] ERROR: %s', 'test method', 'test address', {});
        expect(resMock.status).to.have.been.calledWith(500);
        expect(resMock.send).to.have.been.called;

        handlers[1]({ status: 199 }, reqMock, resMock);
        expect(consoleErrorMock).to.have.been.calledWith('[%s][%s] ERROR: %s', 'test method', 'test address', { status: 199 });
        expect(resMock.status).to.have.been.calledWith(199);
        expect(resMock.send).to.have.been.called;
    }));
});