var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

describe('The database module', function() {
    var processOnMock, processExitMock, processOnCallbackMock, consoleInfoMock, consoleWarnMock, consoleErrorMock;

    var processOnFunctionMock = function (signal, callback) {
        processOnCallbackMock = callback;
    };
    
    beforeEach(function () {
        processOnMock = sinon.stub(process, 'on', processOnFunctionMock);
        processExitMock = sinon.stub(process, 'exit');
        consoleInfoMock = sinon.stub(console, 'info');
        consoleWarnMock = sinon.stub(console, 'warn');
        consoleErrorMock = sinon.stub(console, 'error');
    });
    
    var mongooseMock = sinon.stub();
    var connectionMock = sinon.stub();
    mongooseMock.createConnection = sinon.stub();
    mongooseMock.createConnection.returns(connectionMock);

    it('should perform default configuration', function () {
        var handlers = {};
        connectionMock.on = function (event, handler) {
            handlers[event] = handler;
        };
        var connectionCloseSpy = sinon.spy();
        var connectionCloseCallback;
        connectionMock.close = function (callback) {
            connectionCloseSpy();
            connectionCloseCallback = callback;
        };

        var connection = require('../../../app/config/database')(mongooseMock);

        expect(connection).to.be.equal(connectionMock);
        expect(mongooseMock.createConnection).to.have.been.calledWith('mongodb://localhost:27017/clhApp',
            {server: {poolSize: 1}});
        expect(Object.keys(handlers).length).to.be.equal(5);
        handlers['connected']();
        expect(consoleInfoMock).to.have.been.calledWith('Mongoose connection open to mongodb://localhost:27017/clhApp');
        handlers['error']('test error');
        expect(consoleErrorMock).to.have.been.calledWith('Mongoose connection error: test error');
        handlers['open']();
        expect(consoleInfoMock).to.have.been.calledWith('Mongoose connection opened!');
        handlers['reconnected']();
        expect(consoleInfoMock).to.have.been.calledWith('Mongoose reconnected!');
        handlers['disconnected']();
        expect(consoleWarnMock).to.have.been.calledWith('Mongoose disconnected!');
        expect(processOnMock).to.have.been.calledWith('SIGINT', sinon.match.func);
        expect(processOnCallbackMock).to.be.a('function');
        processOnCallbackMock();
        expect(connectionCloseSpy).to.have.been.called;
        expect(connectionCloseCallback).to.be.a('function');
        connectionCloseCallback();
        expect(consoleErrorMock).to.have.been.calledWith('Mongoose connection disconnected through app termination');
        expect(processExitMock).to.have.been.calledWith(0);
    });

    afterEach(function () {
        console.info.restore();
        console.warn.restore();
        console.error.restore();
        process.on.restore();
        process.exit.restore();
    });
});