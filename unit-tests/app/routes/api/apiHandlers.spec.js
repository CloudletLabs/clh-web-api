'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

let handlersModule = require('../../../../app/routes/api/apiHandlers');

describe('The apiHandlers module', function() {
    let sandbox = sinon.sandbox.create();
    let reqMock,
        resMock,
        nextMock,
        consoleWarnMock,
        consoleErrorMock;
    
    beforeEach(function () {
        reqMock = sandbox.stub();
        reqMock.logPrefix = 'test prefix';
        resMock = sandbox.stub();
        resMock.status = sandbox.stub();
        resMock.json = sandbox.stub();
        resMock.send = sandbox.stub();
        nextMock = sandbox.stub();
        consoleWarnMock = sandbox.stub(console, 'warn');
        consoleErrorMock = sandbox.stub(console, 'error');
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should have functions', function () {
        expect(Object.keys(handlersModule).length).to.be.equal(5);
        expect(handlersModule.notFoundHandler).to.be.a('function');
        expect(handlersModule.errorHandler).to.be.a('function');
        expect(handlersModule.status).to.be.a('function');
        expect(handlersModule.info).to.be.a('function');
        expect(handlersModule.sendRes).to.be.a('function');
    });

    it('should handle 404', sinon.test(function () {
        handlersModule.notFoundHandler(reqMock, resMock);

        expect(consoleWarnMock).to.have.been.calledWithExactly('%s API 404: Not Found', 'test prefix');
        expect(resMock.status).to.have.been.calledWithExactly(404);
        expect(resMock.json).to.have.been.calledWithExactly({message: 'Not found'});
    }));

    it('should handle unknown api error', sinon.test(function () {
        handlersModule.errorHandler({}, reqMock, resMock);

        expect(consoleErrorMock).to.have.been.calledWithExactly('%s API ERROR %s: %s', 'test prefix', 500, 'Unknown API error');
        expect(resMock.status).to.have.been.calledWithExactly(500);
        expect(resMock.json).to.have.been.calledWithExactly({message: 'Unknown API error'});
    }));

    it('should handle api error', sinon.test(function () {
        handlersModule.errorHandler({status: 501, message: 'Dummy error'}, reqMock, resMock);

        expect(consoleErrorMock).to.have.been.calledWithExactly('%s API ERROR %s: %s', 'test prefix', 501, 'Dummy error');
        expect(resMock.status).to.have.been.calledWithExactly(501);
        expect(resMock.json).to.have.been.calledWithExactly({message: 'Dummy error'});
    }));

    it('should handle api warning', sinon.test(function () {
        handlersModule.errorHandler({status: 401, message: 'Dummy warning'}, reqMock, resMock);

        expect(consoleWarnMock).to.have.been.calledWithExactly('%s API WARN %s: %s', 'test prefix', 401, 'Dummy warning');
        expect(resMock.status).to.have.been.calledWithExactly(401);
        expect(resMock.json).to.have.been.calledWithExactly({message: 'Dummy warning'});
    }));

    it('should handle status', sinon.test(function () {
        let apiMock = this.stub();
        apiMock.pJson = { name: 'test api' };

        let status = handlersModule.status(apiMock);
        status(reqMock, resMock);

        expect(resMock.send).to.have.been.calledWithExactly('test api: ok');
    }));

    it('should handle info', sinon.test(function () {
        let apiMock = this.stub();
        apiMock.pJson = {};
        apiMock.pJson.name = this.stub();
        apiMock.pJson.version = this.stub();
        apiMock.apiVersion = this.stub();

        let info = handlersModule.info(apiMock);
        info(reqMock, resMock);

        expect(resMock.json).to.have.been.calledWithExactly(
            {name: apiMock.pJson.name, version: apiMock.pJson.version, apiVersion: apiMock.apiVersion});
    }));

    it('should send response', sinon.test(function () {
        let resultMock = this.stub();

        let handler = handlersModule.sendRes(resMock, null);
        handler(null, resultMock);

        expect(resMock.json).to.have.been.calledWithExactly(resultMock);
    }));

    it('should not send response', sinon.test(function () {
        let handler = handlersModule.sendRes(null, nextMock);
        handler();

        expect(nextMock).to.have.been.calledWithExactly();
    }));

    it('should send error', sinon.test(function () {
        let errMock = this.stub();

        let handler = handlersModule.sendRes(null, nextMock);
        handler(errMock);

        expect(nextMock).to.have.been.calledWithExactly(errMock);
        expect(resMock.json).not.to.have.been.called;
    }));
});