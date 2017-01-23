var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var logger = require('../../app/logger');

describe('The logger module', function() {
    it('should have functions', sinon.test(function () {
        expect(Object.keys(logger).length).to.be.equal(2);
        expect(logger.log).to.be.a('function');
        expect(logger._log).to.be.a('function');
    }));

    describe('_log', function () {
        it('should info', sinon.test(function () {
            console.info = this.stub();
            var id = 'test id';

            logger._log('info', [id]);

            expect(console.info).to.have.been.calledWithExactly('test id');
        }));

        it('should warn', sinon.test(function () {
            console.warn = this.stub();
            var id = 'test id';

            logger._log('warn', [id]);

            expect(console.warn).to.have.been.calledWithExactly('test id');
        }));

        it('should error with additional data', sinon.test(function () {
            console.error = this.stub();
            var id = 'test id';

            logger._log('error', [id, '%s:%s', 'arg1', 'arg2']);

            expect(console.error).to.have.been.calledWithExactly('test id %s:%s', 'arg1', 'arg2');
        }));
    });

    describe('log', function () {
        it('should be a wrapper', sinon.test(function () {
            logger._log = this.stub();

            var log = logger.log();
            expect(Object.keys(log).length).to.be.equal(3);
            expect(log.info).to.be.a('function');
            expect(log.warn).to.be.a('function');
            expect(log.error).to.be.a('function');

            var idMock = this.stub();
            var msgMock = this.stub();
            var msgArg1 = this.stub();
            var msgArg2 = this.stub();

            log.info(idMock, msgMock, msgArg1, msgArg2);
            expect(logger._log).to.have.been.calledWith('info');
            expect(logger._log.args[0][1][0]).to.eql(idMock);
            expect(logger._log.args[0][1][1]).to.eql(msgMock);
            expect(logger._log.args[0][1][2]).to.eql(msgArg1);
            expect(logger._log.args[0][1][3]).to.eql(msgArg2);

            log.warn(idMock, msgMock, msgArg1, msgArg2);
            expect(logger._log).to.have.been.calledWith('warn');
            expect(logger._log.args[1][1][0]).to.eql(idMock);
            expect(logger._log.args[1][1][1]).to.eql(msgMock);
            expect(logger._log.args[1][1][2]).to.eql(msgArg1);
            expect(logger._log.args[1][1][3]).to.eql(msgArg2);

            log.error(idMock, msgMock, msgArg1, msgArg2);
            expect(logger._log).to.have.been.calledWith('error');
            expect(logger._log.args[2][1][0]).to.eql(idMock);
            expect(logger._log.args[2][1][1]).to.eql(msgMock);
            expect(logger._log.args[2][1][2]).to.eql(msgArg1);
            expect(logger._log.args[2][1][3]).to.eql(msgArg2);
        }));
    });
});