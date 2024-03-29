'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

let controllerHelpers = require('../../app/controllers/controllerHelpers');

describe('The controllerHelpers module', function() {
    let sandbox = sinon.sandbox.create();
    let doneMock,
        callbackMock,
        resultMock,
        errorMock;
    
    beforeEach(function () {
        doneMock = sandbox.stub();
        callbackMock = sandbox.stub();
        resultMock = sandbox.stub();
        resultMock.toObject = sandbox.stub();
        resultMock.toObject.returns(resultMock.toObject);
        errorMock = sandbox.stub();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should have functions', function () {
        expect(Object.keys(controllerHelpers).length).to.be.equal(10);
        expect(controllerHelpers.exec).to.be.a('function');
        expect(controllerHelpers.ensureNotExist).to.be.a('function');
        expect(controllerHelpers.save).to.be.a('function');
        expect(controllerHelpers.populate).to.be.a('function');
        expect(controllerHelpers.populateExec).to.be.a('function');
        expect(controllerHelpers.updateFields).to.be.a('function');
        expect(controllerHelpers.get).to.be.a('function');
        expect(controllerHelpers.create).to.be.a('function');
        expect(controllerHelpers.update).to.be.a('function');
        expect(controllerHelpers.remove).to.be.a('function');
    });
    
    describe('exec', function () {
        let conditionMock;
        
        beforeEach(function () {
            conditionMock = sandbox.stub();
            conditionMock.exec = sandbox.stub();
        });

        let commonTests = function () {
            expect(conditionMock.exec).to.have.been.calledWithExactly(sinon.match.func);
        };

        it('should success where result is array', function () {
            conditionMock.exec.callsArgWith(0, null, [resultMock]);

            controllerHelpers.exec(conditionMock, doneMock, null);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(null, [resultMock.toObject]);
        });

        it('should success where result is object', function () {
            conditionMock.exec.callsArgWith(0, null, resultMock);

            controllerHelpers.exec(conditionMock, doneMock, null);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(null, resultMock.toObject);
        });

        it('should success where callback is present', function () {
            conditionMock.exec.callsArgWith(0, null, resultMock);

            controllerHelpers.exec(conditionMock, doneMock, callbackMock);

            commonTests();
            expect(callbackMock).to.have.been.calledWithExactly(resultMock);
        });

        it('should proceed when result is null', function () {
            conditionMock.exec.callsArgWith(0, null, null);

            controllerHelpers.exec(conditionMock, doneMock, null);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly();
        });

        it('should proceed when result is undefined', function () {
            conditionMock.exec.callsArgWith(0, null, undefined);

            controllerHelpers.exec(conditionMock, doneMock, null);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly();
        });

        it('should fail', function () {
            conditionMock.exec.callsArgWith(0, errorMock);

            controllerHelpers.exec(conditionMock, doneMock, null);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(errorMock);
        });
    });
    
    describe('ensureNotExist', function () {
        let conditionMock,
            execMock;
        
        beforeEach(function () {
            conditionMock = sandbox.stub();
            execMock = sandbox.stub(controllerHelpers, 'exec');
        });

        let commonTests = function () {
            expect(execMock).to.have.been.calledWithExactly(conditionMock, doneMock, sinon.match.func);
        };

        it('should callback', function () {
            execMock.callsArgWith(2, 0);

            controllerHelpers.ensureNotExist(conditionMock, doneMock, callbackMock);

            commonTests();
            expect(callbackMock).to.have.been.calledWithExactly();
        });

        it('should done', function () {
            execMock.callsArgWith(2, 0);

            controllerHelpers.ensureNotExist(conditionMock, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(null, true);
        });

        it('should refuse', function () {
            execMock.callsArgWith(2, 1);

            controllerHelpers.ensureNotExist(conditionMock, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly({status: 400, message: "Already exist"});
        });
    });
    
    describe('save', function () {
        let objMock,
            populateConditionMock,
            populateMock;
        
        beforeEach(function () {
            objMock = sandbox.stub();
            objMock.save = sandbox.stub();
            populateConditionMock = sandbox.stub();
            populateMock = sandbox.stub(controllerHelpers, 'populate');
        });

        let commonTests = function () {
            expect(objMock.save).to.have.been.calledWithExactly(sinon.match.func);
        };

        it('should callback', function () {
            objMock.save.callsArgWith(0, null, resultMock);

            controllerHelpers.save(objMock, null, doneMock, callbackMock);

            commonTests();
            expect(callbackMock).to.have.been.calledWithExactly(resultMock);
        });

        it('should done', function () {
            objMock.save.callsArgWith(0, null, resultMock);

            controllerHelpers.save(objMock, null, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(null, resultMock.toObject);
        });

        it('should populate', function () {
            objMock.save.callsArgWith(0, null, resultMock);

            controllerHelpers.save(objMock, populateConditionMock, doneMock, callbackMock);

            commonTests();
            expect(populateMock).to.have.been.calledWithExactly(resultMock, populateConditionMock, doneMock, callbackMock);
        });

        it('should fail', function () {
            objMock.save.callsArg(0);

            controllerHelpers.save(objMock, null, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly({status: 500, message: 'Saved result was null'});
        });

        it('should error', function () {
            objMock.save.callsArgWith(0, errorMock);

            controllerHelpers.save(objMock, null, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(errorMock);
        });
    });

    describe('populateExec', function () {
        let promiseMock;

        beforeEach(function () {
            promiseMock = sandbox.stub();
            promiseMock.then = sandbox.stub();
        });

        let commonTests = function () {
            expect(promiseMock.then).to.have.been.calledWithExactly(sinon.match.func, sinon.match.func);
        };

        it('should callback', function () {
            promiseMock.then.callsArgWith(0, resultMock);

            controllerHelpers.populateExec(promiseMock, doneMock, callbackMock);

            commonTests();
            expect(callbackMock).to.have.been.calledWithExactly(resultMock);
        });

        it('should done', function () {
            promiseMock.then.callsArgWith(0, resultMock);

            controllerHelpers.populateExec(promiseMock, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(null, resultMock.toObject);
        });

        it('should fail', function () {
            promiseMock.then.callsArg(0);

            controllerHelpers.populateExec(promiseMock, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly({status: 500, message: 'Populated result was null'});
        });

        it('should error', function () {
            promiseMock.then.callsArgWith(1, errorMock);

            controllerHelpers.populateExec(promiseMock, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(errorMock);
        });
    });

    it('should populate', function () {
        let objMock = sandbox.stub();
        let populateConditionMock = sandbox.stub();
        let conditionMock = sandbox.stub();
        populateConditionMock.apply = sandbox.stub().returns(conditionMock);
        let execMock = sandbox.stub();
        conditionMock.execPopulate = sandbox.stub().returns(execMock);
        let populateExecMock = sandbox.stub(controllerHelpers, 'populateExec');

        controllerHelpers.populate(objMock, populateConditionMock, doneMock, callbackMock);

        expect(populateConditionMock.apply).to.have.been.calledWithExactly(objMock);
        expect(conditionMock.execPopulate).to.have.been.calledWithExactly();
        expect(populateExecMock).to.have.been.calledWithExactly(execMock, doneMock, callbackMock);
    });

    it('should updateFields', function () {
        let conditionMock = sandbox.stub();
        let originalMock = {
            _id: 'default__id',
            __v: 'default___v',
            field1: 'default1',
            field3: 'default3'
        };
        let updatedMock = {
            _id: 'new__id',
            __v: 'new___v',
            field1: 'value1',
            field2: 'value2'
        };
        let populateConditionMock = sandbox.stub();
        let execMock = sandbox.stub(controllerHelpers, 'exec');
        execMock.callsArgWith(2, originalMock);
        let saveMock = sandbox.stub(controllerHelpers, 'save');

        controllerHelpers.updateFields(conditionMock, updatedMock, populateConditionMock, doneMock, callbackMock);

        expect(execMock).to.have.been.calledWithExactly(conditionMock, doneMock, sinon.match.func);
        expect(saveMock).to.have.been.calledWithExactly(originalMock, populateConditionMock, doneMock, callbackMock);
        expect(originalMock).to.eql({
            _id: 'default__id',
            __v: 'default___v',
            field1: 'value1',
            field2: 'value2',
            field3: 'default3'
        });
    });
    
    describe('get', function () {
        let conditionMock,
            execMock;
        
        beforeEach(function () {
            conditionMock = sandbox.stub();
            execMock = sandbox.stub(controllerHelpers, 'exec');
        });

        it('should add defaultPopulate', function () {
            conditionMock.defaultPopulate = sandbox.stub();
            conditionMock.defaultPopulate.returns(conditionMock);
            execMock.callsArgWith(2, resultMock);

            controllerHelpers.get(conditionMock, conditionMock.defaultPopulate, doneMock, callbackMock);

            expect(conditionMock.defaultPopulate).to.have.been.calledWithExactly();
            expect(execMock).to.have.been.calledWithExactly(conditionMock, doneMock, callbackMock);
        });

        it('should skip defaultPopulate', function () {
            execMock.callsArgWith(2, resultMock);

            controllerHelpers.get(conditionMock, null, doneMock, callbackMock);

            expect(execMock).to.have.been.calledWithExactly(conditionMock, doneMock, callbackMock);
        });
    });

    it('should create', function () {
        let existenceCheckConditionMock = sandbox.stub();
        let objMock = sandbox.stub();
        let populateConditionMock = sandbox.stub();
        let ensureNotExistMock = sandbox.stub(controllerHelpers, 'ensureNotExist');
        ensureNotExistMock.callsArg(2);
        let saveMock = sandbox.stub(controllerHelpers, 'save');

        controllerHelpers.create(existenceCheckConditionMock, objMock, populateConditionMock, doneMock, callbackMock);

        expect(ensureNotExistMock).to.have.been.calledWithExactly(existenceCheckConditionMock, doneMock, sinon.match.func);
        expect(saveMock).to.have.been.calledWithExactly(objMock, populateConditionMock, doneMock, callbackMock);
    });
    
    describe('update', function () {
        let conditionMock,
            updatedMock,
            populateConditionMock,
            ensureNotExistMock,
            updateFieldsMock;
        
        beforeEach(function () {
            conditionMock = sandbox.stub();
            updatedMock = sandbox.stub();
            populateConditionMock = sandbox.stub();

            ensureNotExistMock = sandbox.stub(controllerHelpers, 'ensureNotExist');
            updateFieldsMock = sandbox.stub(controllerHelpers, 'updateFields');
        });

        it('should ensureNotExist', function () {
            let keyFieldUpdateConditionMock = sandbox.stub();
            ensureNotExistMock.callsArg(2);

            controllerHelpers.update(
                conditionMock, keyFieldUpdateConditionMock, updatedMock, populateConditionMock, doneMock, callbackMock);

            expect(ensureNotExistMock).to.have.been.calledWithExactly(
                keyFieldUpdateConditionMock, doneMock, sinon.match.func);
            expect(updateFieldsMock).to.have.been.calledWithExactly(
                conditionMock, updatedMock, populateConditionMock, doneMock, callbackMock);
        });

        it('should skip ensureNotExist', function () {
            controllerHelpers.update(
                conditionMock, null, updatedMock, populateConditionMock, doneMock, callbackMock);

            expect(ensureNotExistMock).to.not.have.been.called;
            expect(updateFieldsMock).to.have.been.calledWithExactly(
                conditionMock, updatedMock, populateConditionMock, doneMock, callbackMock);
        });
    });

    describe('remove', function () {
        let promiseMock;
        
        beforeEach(function () {
            promiseMock = sandbox.stub();
            promiseMock.then = sandbox.stub();
        });
        
        let commonTests = function () {
            expect(promiseMock.then).to.have.been.calledWithExactly(sinon.match.func, sinon.match.func);
        };

        it('should callback', function () {
            promiseMock.then.callsArg(0);

            controllerHelpers.remove(promiseMock, doneMock, callbackMock);

            commonTests();
            expect(callbackMock).to.have.been.calledWithExactly();
        });

        it('should done', function () {
            promiseMock.then.callsArg(0);

            controllerHelpers.remove(promiseMock, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(null, {});
        });

        it('should error', function () {
            promiseMock.then.callsArgWith(1, errorMock);

            controllerHelpers.remove(promiseMock, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(errorMock);
        });

        it('should unknown error', function () {
            promiseMock.then.callsArgWith(1);

            controllerHelpers.remove(promiseMock, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly({status: 500, message: 'Unknown error when removing object'});
        });
    });

});
