'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

let handlersModule = require('../../../../app/routes/api/apiHandlers');

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
        let req = {
            logPrefix: 'test prefix'
        };
        let respMock = this.stub();
        respMock.status = this.stub();
        respMock.json = this.stub();

        handlersModule.notFoundHandler(req, respMock);

        expect(console.warn).to.have.been.calledWithExactly('%s API 404: Not Found', 'test prefix');
        expect(respMock.status).to.have.been.calledWithExactly(404);
        expect(respMock.json).to.have.been.calledWithExactly({message: 'Not found'});
    }));

    it('should handle unknown api error', sinon.test(function () {
        console.error = this.stub();
        let req = {
            logPrefix: 'test prefix'
        };
        let respMock = this.stub();
        respMock.status = this.stub();
        respMock.json = this.stub();

        handlersModule.errorHandler({}, req, respMock);

        expect(console.error).to.have.been.calledWithExactly('%s API ERROR %s: %s', 'test prefix', 500, 'Unknown API error');
        expect(respMock.status).to.have.been.calledWithExactly(500);
        expect(respMock.json).to.have.been.calledWithExactly({message: 'Unknown API error'});
    }));

    it('should handle api error', sinon.test(function () {
        console.error = this.stub();
        let req = {
            logPrefix: 'test prefix'
        };
        let respMock = this.stub();
        respMock.status = this.stub();
        respMock.json = this.stub();

        handlersModule.errorHandler({status: 501, message: 'Dummy error'}, req, respMock);

        expect(console.error).to.have.been.calledWithExactly('%s API ERROR %s: %s', 'test prefix', 501, 'Dummy error');
        expect(respMock.status).to.have.been.calledWithExactly(501);
        expect(respMock.json).to.have.been.calledWithExactly({message: 'Dummy error'});
    }));

    it('should handle api warning', sinon.test(function () {
        console.warn = this.stub();
        let req = {
            logPrefix: 'test prefix'
        };
        let respMock = this.stub();
        respMock.status = this.stub();
        respMock.json = this.stub();

        handlersModule.errorHandler({status: 401, message: 'Dummy warning'}, req, respMock);

        expect(console.warn).to.have.been.calledWithExactly('%s API WARN %s: %s', 'test prefix', 401, 'Dummy warning');
        expect(respMock.status).to.have.been.calledWithExactly(401);
        expect(respMock.json).to.have.been.calledWithExactly({message: 'Dummy warning'});
    }));

    it('should handle status', sinon.test(function () {
        let apiMock = this.stub();
        apiMock.pJson = { name: 'test api' };
        let reqMock = this.stub();
        let resMock = this.stub();
        resMock.send = this.stub();

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
        let reqMock = this.stub();
        let resMock = this.stub();
        resMock.json = this.stub();

        let info = handlersModule.info(apiMock);
        info(reqMock, resMock);

        expect(resMock.json).to.have.been.calledWithExactly(
            {name: apiMock.pJson.name, version: apiMock.pJson.version, apiVersion: apiMock.apiVersion});
    }));

    it('should send response', sinon.test(function () {
        let resMock = this.stub();
        resMock.json = this.stub();
        let resultMock = this.stub();

        let handler = handlersModule.sendRes(resMock, null);
        handler(null, resultMock);

        expect(resMock.json).to.have.been.calledWithExactly(resultMock);
    }));

    it('should not send response', sinon.test(function () {
        let nextMock = this.stub();

        let handler = handlersModule.sendRes(null, nextMock);
        handler();

        expect(nextMock).to.have.been.calledWithExactly();
    }));

    it('should send error', sinon.test(function () {
        let resMock = this.stub();
        resMock.json = this.stub();
        let nextMock = this.stub();
        let errMock = this.stub();

        let handler = handlersModule.sendRes(null, nextMock);
        handler(errMock);

        expect(nextMock).to.have.been.calledWithExactly(errMock);
        expect(resMock.json).not.to.have.been.called;
    }));
});