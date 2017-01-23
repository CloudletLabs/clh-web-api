var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var handlersModule = require('../../../../app/routes/api/apiHandlers');

describe('The apiHandlers module', function() {
    it('should have functions', sinon.test(function () {
        expect(Object.keys(handlersModule).length).to.be.equal(5);
        expect(handlersModule.generateRequestId).to.be.a('function');
        expect(handlersModule.notFoundHandler).to.be.a('function');
        expect(handlersModule.errorHandler).to.be.a('function');
        expect(handlersModule.status).to.be.a('function');
        expect(handlersModule.info).to.be.a('function');
    }));

    it('should generate anonymous request id', sinon.test(function () {
        var req = {
            method: 'test method',
            connection: {
                remoteAddress: 'test address'
            },
            path: 'test path'
        };

        var id = handlersModule.generateRequestId(req);
        expect(id).to.eql('[test method][test address][test path]');
    }));

    it('should generate request id with user', sinon.test(function () {
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

        var id = handlersModule.generateRequestId(req);
        expect(id).to.eql('[test method][test address][test path][test username]');
    }));

    it('should generate request id with token', sinon.test(function () {
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

        var id = handlersModule.generateRequestId(req);
        expect(id).to.eql('[test method][test address][test path][test username]');
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