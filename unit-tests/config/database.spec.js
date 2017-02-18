'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

let database = require('../../app/config/database');

describe('The database module', function() {
    let sandbox = sinon.sandbox.create();

    let mongooseMock,
        connectionMock,
        processMock,
        processHandlerMock,
        consoleInfoMock,
        consoleWarnMock,
        consoleErrorMock;

    beforeEach(function () {
        mongooseMock = sandbox.stub();
        connectionMock = sandbox.stub();
        connectionMock.on = function () {};
        connectionMock.handlers = {};
        mongooseMock.createConnection = sandbox.stub().returns(connectionMock);
        var onMock = function(obj) {
            obj.handlers = {};
            return function (name, handler) {
                obj.handlers[name] = handler;
            };
        };
        sandbox.stub(connectionMock, 'on', onMock(connectionMock));
        processMock = sandbox.stub();
        processHandlerMock = sandbox.stub(process, 'on', onMock(processMock));
        consoleInfoMock = sandbox.stub(console, 'info');
        consoleWarnMock = sandbox.stub(console, 'warn');
        consoleErrorMock = sandbox.stub(console, 'error');
    });

    afterEach(function () {
        sandbox.restore();
    });

    let commonTests = function (connection) {
        expect(connection).to.equals(connectionMock);
        expect(mongooseMock.Promise).to.equals(global.Promise);
        expect(Object.keys(connectionMock.handlers)).to.be.eql([
            'connected', 'error', 'open', 'reconnected', 'disconnected'
        ]);
        expect(connectionMock.handlers['connected']).to.be.a('function');
        expect(connectionMock.handlers['error']).to.be.a('function');
        expect(connectionMock.handlers['open']).to.be.a('function');
        expect(connectionMock.handlers['reconnected']).to.be.a('function');
        expect(connectionMock.handlers['disconnected']).to.be.a('function');
        expect(Object.keys(processMock.handlers)).to.be.eql(['SIGINT']);
        expect(processMock.handlers['SIGINT']).to.be.a('function');
    };

    it('should perform default configuration', function () {
        sandbox.stub(process, 'env', {
            MONGODB_URI: null,
            MONGODB_POOL_SIZE: null
        });

        let connection = database(mongooseMock);

        commonTests(connection);
        expect(mongooseMock.createConnection).to.have.been.calledWithExactly(
            'mongodb://localhost:27017/clhApp', {server: {poolSize: 1}});
    });

    it('should perform configuration', function () {
        sandbox.stub(process, 'env', {
            MONGODB_URI: 'test uri',
            MONGODB_POOL_SIZE: '2'
        });

        let connection = database(mongooseMock);

        commonTests(connection);
        expect(mongooseMock.createConnection).to.have.been.calledWithExactly(
            'test uri', {server: {poolSize: '2'}});
    });

    describe('handlers', function () {
        let connection;

        beforeEach(function () {
            sandbox.stub(process, 'env', {
                MONGODB_URI: 'test uri',
                MONGODB_POOL_SIZE: '2'
            });
            connection = database(mongooseMock);
        });

        describe('connection', function () {

            it('connected', function () {
                connection.handlers['connected']();

                expect(consoleInfoMock).to.have.been.calledWithExactly('Mongoose connection open to test uri');
            });

            it('error', function () {
                let errorMock = 'test error';

                connection.handlers['error'](errorMock);

                expect(consoleErrorMock).to.have.been.calledWithExactly('Mongoose connection error: test error');
            });

            it('open', function () {
                connection.handlers['open']();

                expect(consoleInfoMock).to.have.been.calledWithExactly('Mongoose connection opened!');
            });

            it('reconnected', function () {
                connection.handlers['reconnected']();

                expect(consoleInfoMock).to.have.been.calledWithExactly('Mongoose reconnected!');
            });

            it('disconnected', function () {
                connection.handlers['disconnected']();

                expect(consoleWarnMock).to.have.been.calledWithExactly('Mongoose disconnected!');
            });
        });

        describe('process', function () {
            it('SIGINT', function () {
                connectionMock.close = sandbox.stub().callsArg(0);
                let processExit = sandbox.stub(process, 'exit');

                processMock.handlers['SIGINT']();

                expect(connectionMock.close).to.have.been.calledWithExactly(sinon.match.func);
                expect(consoleErrorMock).to.have.been.calledWithExactly(
                    'Mongoose connection disconnected through app termination');
                expect(processExit).to.have.been.calledWithExactly(0);
            });
        });
    });
});