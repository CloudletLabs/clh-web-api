'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

let logger = require('../../app/logger');

describe('The logger module', function() {
    let sandbox = sinon.sandbox.create();

    afterEach(function () {
        sandbox.restore();
    });

    it('should have functions', function () {
        expect(Object.keys(logger).length).to.be.equal(4);
        expect(logger.logger).to.be.an('object');
        expect(logger.logger.info).to.be.an('function');
        expect(logger.logger.warn).to.be.an('function');
        expect(logger.logger.error).to.be.an('function');
        expect(logger._log).to.be.a('function');
        expect(logger.logPrefixGenerator).to.be.a('function');
        expect(logger.reqLogger).to.be.a('function');
    });

    describe('_log', function () {
        let idMock,
            consoleInfoMock,
            consoleWarnMock,
            consoleErrorMock;
        
        beforeEach(function () {
            idMock = 'test id';
            consoleInfoMock = sandbox.stub(console, 'info');
            consoleWarnMock = sandbox.stub(console, 'warn');
            consoleErrorMock = sandbox.stub(console, 'error');
        });
        
        it('should info', function () {
            logger._log('info', [idMock]);

            expect(consoleInfoMock).to.have.been.calledWithExactly('test id');
        });

        it('should warn', function () {
            logger._log('warn', [idMock]);

            expect(consoleWarnMock).to.have.been.calledWithExactly('test id');
        });

        it('should error with additional data', function () {
            logger._log('error', [idMock, '%s:%s', 'arg1', 'arg2']);

            expect(consoleErrorMock).to.have.been.calledWithExactly('test id %s:%s', 'arg1', 'arg2');
        });
    });

    describe('log', function () {
        let idMock,
            msgMock,
            msgArg1,
            msgArg2,
            logMock,
            log;
        
        beforeEach(function () {
            logMock = sandbox.stub(logger, '_log');
            log = logger.logger;

            idMock = sandbox.stub();
            msgMock = sandbox.stub();
            msgArg1 = sandbox.stub();
            msgArg2 = sandbox.stub();
        });
        
        it('should be a wrapper', function () {
            expect(Object.keys(log).length).to.be.equal(3);
            expect(log.info).to.be.a('function');
            expect(log.warn).to.be.a('function');
            expect(log.error).to.be.a('function');
        });
        
        let commonTests = function () {
            expect(logMock.args[0][1][0]).to.eql(idMock);
            expect(logMock.args[0][1][1]).to.eql(msgMock);
            expect(logMock.args[0][1][2]).to.eql(msgArg1);
            expect(logMock.args[0][1][3]).to.eql(msgArg2);
        };

        it('should info', function () {
            log.info(idMock, msgMock, msgArg1, msgArg2);
            expect(logMock).to.have.been.calledWith('info');
            commonTests();
        });

        it('should warn', function () {
            log.warn(idMock, msgMock, msgArg1, msgArg2);
            expect(logMock).to.have.been.calledWith('warn');
            commonTests();
        });

        it('should error', function () {
            log.error(idMock, msgMock, msgArg1, msgArg2);
            expect(logMock).to.have.been.calledWith('error');
            commonTests();
        });
    });
    
    describe('logPrefixGenerator', function () {
        let nextMock,
            reqMock;

        beforeEach(function () {
            nextMock = sandbox.stub();
            reqMock = {
                method: 'test method',
                connection: {
                    remoteAddress: 'test address'
                },
                path: 'test path'
            };
        });

        var commonTests = function () {
            expect(nextMock).to.have.been.called;
        };

        it('should generate anonymous log prefix', sinon.test(function () {
            logger.logPrefixGenerator(reqMock, null, nextMock);

            expect(reqMock.logPrefix).to.eql('[test method][test address][test path]');
            commonTests();
        }));

        it('should generate log prefix with user', sinon.test(function () {
            reqMock.user = {
                username: 'test username'
            };

            logger.logPrefixGenerator(reqMock, null, nextMock);

            expect(reqMock.logPrefix).to.eql('[test method][test address][test path][test username]');
            commonTests();
        }));

        it('should generate log prefix with token', sinon.test(function () {
            reqMock.user = {
                user: {
                    username: 'test username'
                }
            };

            logger.logPrefixGenerator(reqMock, null, nextMock);

            expect(reqMock.logPrefix).to.eql('[test method][test address][test path][test username]');
            commonTests();
        }));
    });
    
    describe('reqLogger', function () {
        it('should log requests', function () {
            logger.logger = sandbox.stub();
            logger.logger.info = sandbox.stub();

            let reqMock = sandbox.stub();
            reqMock.logPrefix = sandbox.stub();
            let nextMock = sandbox.stub();

            logger.reqLogger(reqMock, null, nextMock);

            expect(logger.logger.info).to.have.been.calledWithExactly(reqMock.logPrefix);
            expect(nextMock).to.have.been.called;
        });
    });
});