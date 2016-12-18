var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

describe('The config module', function() {
    it('should have functions', function () {
        var appConfig = require('../../app/config');

        expect(Object.keys(appConfig).length).to.be.equal(6);
        expect(appConfig.createApp).to.be.a('function');
        expect(appConfig.morgan).to.be.a('function');
        expect(appConfig.originHeaders).to.be.a('function');
        expect(appConfig.parsingMiddleware).to.be.a('function');
        expect(appConfig.routes).to.be.a('function');
        expect(appConfig.errors).to.be.a('function');
    });

    it('should create app', function () {
        var expressMock = sinon.stub();
        var appMock = sinon.stub();
        expressMock.returns(appMock);

        var appConfig = require('../../app/config');
        var app = appConfig.createApp(expressMock);

        expect(app).to.be.equal(appMock);
    });

    it('should configure morgan for dev', function () {
        var appMock = sinon.stub();
        appMock.get = sinon.stub();
        appMock.get.withArgs('env').returns('development');
        appMock.use = sinon.stub();
        var morganMock = sinon.stub();
        var config;
        var morganFunctionSpy = sinon.spy();
        var morganFunctionMock = function (env, actualConfig) {
            morganFunctionSpy(env, actualConfig);
            config = actualConfig;
            return morganMock;
        };

        var appConfig = require('../../app/config');
        appConfig.morgan(appMock, morganFunctionMock);

        expect(appMock.get).to.have.been.calledWith('env');
        expect(appMock.use).to.have.been.calledWith(morganMock);
        expect(morganFunctionSpy).to.have.been.calledWith('dev', config);
        expect(config.skip).to.be.a('function');
        expect(config.skip(null, { statusCode: 399 })).to.be.true;
        expect(config.skip(null, { statusCode: 400 })).to.be.false;
    });

    it('should configure morgan for non dev', function () {
        var appMock = sinon.stub();
        appMock.get = sinon.stub();
        appMock.get.withArgs('env').returns('foo');
        appMock.use = sinon.stub();
        var morganMock = sinon.stub();
        var morganFunctionMock = sinon.stub();
        morganFunctionMock.returns(morganMock);

        var appConfig = require('../../app/config');
        appConfig.morgan(appMock, morganFunctionMock);

        expect(appMock.get).to.have.been.calledWith('env');
        expect(appMock.use).to.have.been.calledWith(morganMock);
        expect(morganFunctionMock).to.have.been.calledWith('combined');
    });

    it('should configure origin headers for OPTIONS request', function () {
        var appMock = sinon.stub();

        var appMockUseSpy = sinon.spy();
        appMock.use = function (configurator) {
            appMockUseSpy();

            var reqMock = sinon.stub();
            reqMock.method = 'OPTIONS';
            var resMock = sinon.stub();
            resMock.setHeader = sinon.spy();
            resMock.status = sinon.stub();
            resMock.status.returns(resMock);
            resMock.send = sinon.spy();
            var nextMock = sinon.spy();

            configurator(reqMock, resMock, nextMock);

            expect(resMock.setHeader).to.have.been.calledWith('Access-Control-Allow-Origin', '*');
            expect(resMock.setHeader).to.have.been.calledWith('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, Content-Type, Content-Length');
            expect(resMock.setHeader).to.have.been.calledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            expect(resMock.status).to.have.been.calledWith(200);
            expect(resMock.send).to.have.been.called;
            expect(nextMock).to.not.have.been.called;
        };

        var appConfig = require('../../app/config');
        appConfig.originHeaders(appMock);

        expect(appMockUseSpy).to.have.been.called;
    });

    it('should configure origin headers for non-OPTIONS requests', function () {
        var appMock = sinon.stub();

        var appMockUseSpy = sinon.spy();
        appMock.use = function (configurator) {
            appMockUseSpy();

            var reqMock = sinon.stub();
            reqMock.method = 'foo';
            var resMock = sinon.stub();
            resMock.setHeader = sinon.spy();
            var nextMock = sinon.spy();

            configurator(reqMock, resMock, nextMock);

            expect(resMock.setHeader).to.have.been.calledWith('Access-Control-Allow-Origin', '*');
            expect(nextMock).to.have.been.called;
        };

        var appConfig = require('../../app/config');
        appConfig.originHeaders(appMock);

        expect(appMockUseSpy).to.have.been.called;
    });

    it('should configure parsing middleware', function () {
        var appMock = sinon.stub();
        appMock.use = sinon.stub();
        var cookieParserFunctionMock = sinon.stub();
        var cookieParserMock = sinon.stub();
        cookieParserFunctionMock.returns(cookieParserMock);
        var bodyParserMock = sinon.stub();
        bodyParserMock.urlencoded = sinon.stub();
        var bodyParserUrlEncodedMock = sinon.stub();
        bodyParserMock.urlencoded.returns(bodyParserUrlEncodedMock);

        var appConfig = require('../../app/config');
        appConfig.parsingMiddleware(appMock, cookieParserFunctionMock, bodyParserMock);

        expect(appMock.use).to.have.been.calledWith(bodyParserUrlEncodedMock);
        expect(bodyParserMock.urlencoded).to.have.been.calledWith({extended: false});
        expect(appMock.use).to.have.been.calledWith(cookieParserMock);
        expect(cookieParserFunctionMock).to.have.been.called;
    });

    it('should configure routes', function () {
        var appMock = sinon.stub();
        appMock.use = sinon.stub();
        var pJsonMock = sinon.stub();
        var expressMock = sinon.stub();
        expressMock.static = sinon.stub();
        expressMock.static.returns('test static');
        var pathMock = sinon.stub();
        pathMock.join = sinon.stub();
        pathMock.join.returns('test path');
        var apiHandlersMock = sinon.stub();
        var errorHandlerMock = sinon.stub();
        apiHandlersMock.errorHandler = errorHandlerMock;
        var v1ApiMock = sinon.stub();
        var v1ApiRouter = sinon.stub();
        v1ApiMock.returns({apiVersion: 1, router: v1ApiRouter});
        var passportMock = sinon.stub();
        var modelsMock = sinon.stub();

        var appConfig = require('../../app/config');
        appConfig.routes(appMock, pJsonMock, expressMock, pathMock, apiHandlersMock, v1ApiMock, passportMock, modelsMock);

        expect(pathMock.join).to.have.been.calledWith(sinon.match.string, '../public');
        expect(expressMock.static).to.have.been.calledWith('test path');
        expect(appMock.use).to.have.been.calledWith('test static');
        expect(v1ApiMock).to.have.been.calledWith(expressMock, appMock, pJsonMock, apiHandlersMock, passportMock, modelsMock);
        expect(appMock.use).to.have.been.calledWith('/api/v1', v1ApiRouter);
        expect(appMock.use).to.have.been.calledWith('/api/v1', errorHandlerMock);
        expect(appMock.use).to.have.been.calledWith('/api/current', v1ApiRouter);
        expect(appMock.use).to.have.been.calledWith('/api/current', errorHandlerMock);
    });

    describe('error handlers', function () {
        var consoleWarnMock, consoleErrorMock;

        beforeEach(function () {
            consoleWarnMock = sinon.stub(console, 'warn');
            consoleErrorMock = sinon.stub(console, 'error');
        });

        it('should configure', function () {
            var appMock = sinon.stub();
            var appUseSpy = sinon.spy();
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
            var resMock = sinon.stub();
            resMock.status = sinon.stub();
            resMock.status.returns(resMock);
            resMock.send = sinon.stub();

            var appConfig = require('../../app/config');
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
        });

        afterEach(function () {
            console.warn.restore();
            console.error.restore();
        });
    });
});