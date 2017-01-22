var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var handlersModule = require('../../../../app/routes/api/apiHandlers');

describe('The apiHandlers module', function() {
    it('should have functions', sinon.test(function () {
        expect(Object.keys(handlersModule).length).to.be.equal(6);
        expect(handlersModule.log).to.be.a('function');
        expect(handlersModule._log).to.be.a('function');
        expect(handlersModule.notFoundHandler).to.be.a('function');
        expect(handlersModule.errorHandler).to.be.a('function');
        expect(handlersModule.status).to.be.a('function');
        expect(handlersModule.info).to.be.a('function');
    }));

    it('should have logger', sinon.test(function () {
        var handlersMock = this.stub();
        handlersMock._log = this.stub();

        var log = handlersModule.log(handlersMock);
        expect(Object.keys(log).length).to.be.equal(3);
        expect(log.info).to.be.a('function');
        expect(log.warn).to.be.a('function');
        expect(log.error).to.be.a('function');

        var reqMock = this.stub();
        var msgMock = this.stub();
        var msgArg1 = this.stub();
        var msgArg2 = this.stub();

        log.info(reqMock, msgMock, msgArg1, msgArg2);
        expect(handlersMock._log).to.have.been.calledWith('info');
        expect(handlersMock._log.args[0][1][0]).to.eql(reqMock);
        expect(handlersMock._log.args[0][1][1]).to.eql(msgMock);
        expect(handlersMock._log.args[0][1][2]).to.eql(msgArg1);
        expect(handlersMock._log.args[0][1][3]).to.eql(msgArg2);

        log.warn(reqMock, msgMock, msgArg1, msgArg2);
        expect(handlersMock._log).to.have.been.calledWith('warn');
        expect(handlersMock._log.args[1][1][0]).to.eql(reqMock);
        expect(handlersMock._log.args[1][1][1]).to.eql(msgMock);
        expect(handlersMock._log.args[1][1][2]).to.eql(msgArg1);
        expect(handlersMock._log.args[1][1][3]).to.eql(msgArg2);

        log.error(reqMock, msgMock, msgArg1, msgArg2);
        expect(handlersMock._log).to.have.been.calledWith('error');
        expect(handlersMock._log.args[2][1][0]).to.eql(reqMock);
        expect(handlersMock._log.args[2][1][1]).to.eql(msgMock);
        expect(handlersMock._log.args[2][1][2]).to.eql(msgArg1);
        expect(handlersMock._log.args[2][1][3]).to.eql(msgArg2);
    }));

    it('should log minimal', sinon.test(function () {
        console.info = this.stub();
        var req = {
            method: 'test method',
            connection: {
                remoteAddress: 'test address'
            },
            path: 'test path'
        };

        handlersModule._log('info', [req]);

        expect(console.info).to.have.been.calledWithExactly('[%s][%s][%s]', 'test method', 'test address', 'test path');
    }));

    it('should info with user', sinon.test(function () {
        console.info = this.stub();
        var req = {
            method: 'test method',
            connection: {
                remoteAddress: 'test address'
            },
            path: 'test path',
            user: {
                username: 'test username'
            }
        };

        handlersModule._log('info', [req]);

        expect(console.info).to.have.been.calledWithExactly(
            '[%s][%s][%s][%s]', 'test method', 'test address', 'test path', 'test username');
    }));

    it('should warn with token', sinon.test(function () {
        console.warn = this.stub();
        var req = {
            method: 'test method',
            connection: {
                remoteAddress: 'test address'
            },
            path: 'test path',
            user: {
                user: {
                    username: 'test username'
                }
            }
        };

        handlersModule._log('warn', [req]);

        expect(console.warn).to.have.been.calledWithExactly(
            '[%s][%s][%s][%s]', 'test method', 'test address', 'test path', 'test username');
    }));

    it('should error with additional data', sinon.test(function () {
        console.error = this.stub();
        var req = {
            method: 'test method',
            connection: {
                remoteAddress: 'test address'
            },
            path: 'test path'
        };

        handlersModule._log('error', [req, '%s:%s', 'arg1', 'arg2']);

        expect(console.error).to.have.been.calledWithExactly(
            '[%s][%s][%s] %s:%s', 'test method', 'test address', 'test path', 'arg1', 'arg2');
    }));

    it('should handle 404', sinon.test(function () {
        console.warn = this.stub();
        var req = {
            method: 'test method',
            connection: {
                remoteAddress: 'test address'
            },
            path: 'test path'
        };
        var respMock = this.stub();
        respMock.status = this.stub();
        respMock.json = this.stub();

        handlersModule.notFoundHandler(req, respMock);

        expect(console.warn).to.have.been.calledWithExactly(
            '[%s][%s] 404: %s', 'test method', 'test address', 'test path');
        expect(respMock.status).to.have.been.calledWithExactly(404);
        expect(respMock.json).to.have.been.calledWithExactly({message: 'Not found'});
    }));

    it('should handle unknown api error', sinon.test(function () {
        console.error = this.stub();
        var req = {
            method: 'test method',
            connection: {
                remoteAddress: 'test address'
            }
        };
        var respMock = this.stub();
        respMock.status = this.stub();
        respMock.json = this.stub();

        handlersModule.errorHandler({}, req, respMock);

        expect(console.error).to.have.been.calledWithExactly(
            '[%s][%s] API ERROR %s: %s', 'test method', 'test address', 500, 'Unknown API error');
        expect(respMock.status).to.have.been.calledWithExactly(500);
        expect(respMock.json).to.have.been.calledWithExactly({message: 'Unknown API error'});
    }));

    it('should handle api error', sinon.test(function () {
        console.error = this.stub();
        var req = {
            method: 'test method',
            connection: {
                remoteAddress: 'test address'
            }
        };
        var respMock = this.stub();
        respMock.status = this.stub();
        respMock.json = this.stub();

        handlersModule.errorHandler({status: 501, message: 'Dummy error'}, req, respMock);

        expect(console.error).to.have.been.calledWithExactly(
            '[%s][%s] API ERROR %s: %s', 'test method', 'test address', 501, 'Dummy error');
        expect(respMock.status).to.have.been.calledWithExactly(501);
        expect(respMock.json).to.have.been.calledWithExactly({message: 'Dummy error'});
    }));

    it('should handle status', sinon.test(function () {
        var apiMock = this.stub();
        apiMock.log = this.stub();
        apiMock.log.info = this.stub();
        var reqMock = this.stub();
        var resMock = this.stub();
        resMock.send = this.stub();

        var status = handlersModule.status(apiMock);
        status(reqMock, resMock);

        expect(apiMock.log.info).to.have.been.calledWithExactly(reqMock);
        expect(resMock.send).to.have.been.calledWithExactly('ok');
    }));

    it('should handle info', sinon.test(function () {
        var apiMock = this.stub();
        apiMock.log = this.stub();
        apiMock.log.info = this.stub();
        apiMock.pJson = this.stub();
        apiMock.pJson.name = this.stub();
        apiMock.pJson.version = this.stub();
        apiMock.apiVersion = this.stub();
        var reqMock = this.stub();
        var resMock = this.stub();
        resMock.json = this.stub();

        var info = handlersModule.info(apiMock);
        info(reqMock, resMock);

        expect(apiMock.log.info).to.have.been.calledWithExactly(reqMock);
        expect(resMock.json).to.have.been.calledWithExactly(
            {name: apiMock.pJson.name, version: apiMock.pJson.version, apiVersion: apiMock.apiVersion});
    }));
});