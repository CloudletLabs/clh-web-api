var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

describe('The database module', function() {

    it('should perform default configuration', sinon.test(function () {
        var mongooseMock = this.stub();
        var connectionMock = this.stub();
        mongooseMock.createConnection = this.stub();
        mongooseMock.createConnection.returns(connectionMock);
        var handlers = {};
        connectionMock.on = function (event, handler) {
            handlers[event] = handler;
        };
        var connectionCloseSpy = this.spy();
        var connectionCloseCallback;
        connectionMock.close = function (callback) {
            connectionCloseSpy();
            connectionCloseCallback = callback;
        };

        var processOnFunctionMock = function (signal, callback) {
            processOnCallbackMock = callback;
        };
        var processOnMock = this.stub(process, 'on', processOnFunctionMock);
        var processExitMock = this.stub(process, 'exit');
        var consoleInfoMock = this.stub(console, 'info');
        var consoleWarnMock = this.stub(console, 'warn');
        var consoleErrorMock = this.stub(console, 'error');

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
    }));
});