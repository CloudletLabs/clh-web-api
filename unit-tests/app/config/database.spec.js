'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

describe('The database module', function() {

    it('should perform default configuration', sinon.test(function () {
        let mongooseMock = this.stub();
        let connectionMock = this.stub();
        mongooseMock.createConnection = this.stub();
        mongooseMock.createConnection.returns(connectionMock);
        let handlers = {};
        connectionMock.on = function (event, handler) {
            handlers[event] = handler;
        };
        let connectionCloseSpy = this.spy();
        let connectionCloseCallback;
        connectionMock.close = function (callback) {
            connectionCloseSpy();
            connectionCloseCallback = callback;
        };

        let processOnCallbackMock;
        let processOnFunctionMock = function (signal, callback) {
            processOnCallbackMock = callback;
        };
        let processOnMock = this.stub(process, 'on', processOnFunctionMock);
        let processExitMock = this.stub(process, 'exit');
        let consoleInfoMock = this.stub(console, 'info');
        let consoleWarnMock = this.stub(console, 'warn');
        let consoleErrorMock = this.stub(console, 'error');

        let connection = require('../../../app/config/database')(mongooseMock);

        expect(connection).to.be.equal(connectionMock);
        expect(mongooseMock.createConnection).to.have.been.calledWithExactly('mongodb://localhost:27017/clhApp',
            {server: {poolSize: 1}});
        expect(Object.keys(handlers).length).to.be.equal(5);
        handlers['connected']();
        expect(consoleInfoMock).to.have.been.calledWithExactly('Mongoose connection open to mongodb://localhost:27017/clhApp');
        handlers['error']('test error');
        expect(consoleErrorMock).to.have.been.calledWithExactly('Mongoose connection error: test error');
        handlers['open']();
        expect(consoleInfoMock).to.have.been.calledWithExactly('Mongoose connection opened!');
        handlers['reconnected']();
        expect(consoleInfoMock).to.have.been.calledWithExactly('Mongoose reconnected!');
        handlers['disconnected']();
        expect(consoleWarnMock).to.have.been.calledWithExactly('Mongoose disconnected!');
        expect(processOnMock).to.have.been.calledWithExactly('SIGINT', sinon.match.func);
        expect(processOnCallbackMock).to.be.a('function');
        processOnCallbackMock();
        expect(connectionCloseSpy).to.have.been.called;
        expect(connectionCloseCallback).to.be.a('function');
        connectionCloseCallback();
        expect(consoleErrorMock).to.have.been.calledWithExactly('Mongoose connection disconnected through app termination');
        expect(processExitMock).to.have.been.calledWithExactly(0);
    }));
});