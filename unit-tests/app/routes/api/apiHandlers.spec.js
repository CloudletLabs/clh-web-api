var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var handlersModule = require('../../../../app/routes/api/apiHandlers');

describe('The apiHandlers module', function() {
    it('should have functions', sinon.test(function () {
        expect(Object.keys(handlersModule).length).to.be.equal(5);
        expect(handlersModule.notFoundHandler).to.be.a('function');
        expect(handlersModule.errorHandler).to.be.a('function');
        expect(handlersModule.status).to.be.a('function');
        expect(handlersModule.info).to.be.a('function');
        expect(handlersModule.sendRes).to.be.a('function');
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
        apiMock.pJson = { name: 'test api' };
        var reqMock = this.stub();
        var resMock = this.stub();
        resMock.send = this.stub();

        var status = handlersModule.status(apiMock);
        status(reqMock, resMock);

        expect(resMock.send).to.have.been.calledWithExactly('test api: ok');
    }));

    it('should handle info', sinon.test(function () {
        var apiMock = this.stub();
        apiMock.pJson = this.stub();
        apiMock.pJson.name = this.stub();
        apiMock.pJson.version = this.stub();
        apiMock.apiVersion = this.stub();
        var reqMock = this.stub();
        var resMock = this.stub();
        resMock.json = this.stub();

        var info = handlersModule.info(apiMock);
        info(reqMock, resMock);

        expect(resMock.json).to.have.been.calledWithExactly(
            {name: apiMock.pJson.name, version: apiMock.pJson.version, apiVersion: apiMock.apiVersion});
    }));
    
    it('should send response', sinon.test(function () {
        var resMock = this.stub();
        resMock.json = this.stub();
        var resultMock = this.stub();

        var handler = handlersModule.sendRes(resMock, null);
        handler(null, resultMock);

        expect(resMock.json).to.have.been.calledWithExactly(resultMock);
    }));

    it('should not send response', sinon.test(function () {
        var resMock = this.stub();
        resMock.json = this.stub();
        var nextMock = this.stub();
        var errMock = this.stub();

        var handler = handlersModule.sendRes(null, nextMock);
        handler(errMock);

        expect(nextMock).to.have.been.calledWithExactly(errMock);
        expect(resMock.json).not.to.have.been.called;
    }));
});