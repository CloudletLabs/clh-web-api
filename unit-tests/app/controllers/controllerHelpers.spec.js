var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var controllerHelpers = require('../../../app/controllers/controllerHelpers');

describe('The controllerHelpers module', function() {
    var sandbox = sinon.sandbox.create();
    var doneMock,
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
        expect(Object.keys(controllerHelpers).length).to.be.equal(9);
        expect(controllerHelpers.exec).to.be.a('function');
        expect(controllerHelpers.ensureNotExist).to.be.a('function');
        expect(controllerHelpers.save).to.be.a('function');
        expect(controllerHelpers.populate).to.be.a('function');
        expect(controllerHelpers.updateFields).to.be.a('function');
        expect(controllerHelpers.get).to.be.a('function');
        expect(controllerHelpers.create).to.be.a('function');
        expect(controllerHelpers.update).to.be.a('function');
        expect(controllerHelpers.remove).to.be.a('function');
    });
    
    describe('exec', function () {
        var conditionMock;
        
        beforeEach(function () {
            conditionMock = sandbox.stub();
            conditionMock.exec = sandbox.stub();
        });

        var commonTests = function () {
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
        var conditionMock,
            execMock;
        
        beforeEach(function () {
            conditionMock = sandbox.stub();
            execMock = sandbox.stub(controllerHelpers, 'exec');
        });

        var commonTests = function () {
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
        var objMock,
            populateConditionMock,
            populateMock;
        
        beforeEach(function () {
            objMock = sandbox.stub();
            objMock.save = sandbox.stub();
            populateConditionMock = sandbox.stub();
            populateMock = sandbox.stub(controllerHelpers, 'populate');
        });

        var commonTests = function () {
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

    describe('populate', function () {
        var objMock,
            populateConditionMock,
            promiseMock;

        beforeEach(function () {
            objMock = sandbox.stub();
            populateConditionMock = sandbox.stub();
            promiseMock = sandbox.stub();

            populateConditionMock.apply = sandbox.stub().returns(populateConditionMock);
            populateConditionMock.execPopulate = sandbox.stub().returns(promiseMock);
            promiseMock.then = sandbox.stub();
        });

        var commonTests = function () {
            expect(populateConditionMock.apply).to.have.been.calledWithExactly(objMock);
            expect(populateConditionMock.execPopulate).to.have.been.calledWithExactly();
        };

        it('should callback', function () {
            promiseMock.then.callsArgWith(0, resultMock);

            controllerHelpers.populate(objMock, populateConditionMock, doneMock, callbackMock);

            commonTests();
            expect(callbackMock).to.have.been.calledWithExactly(resultMock);
        });

        it('should done', function () {
            promiseMock.then.callsArgWith(0, resultMock);

            controllerHelpers.populate(objMock, populateConditionMock, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(null, resultMock.toObject);
        });

        it('should fail', function () {
            promiseMock.then.callsArg(0);

            controllerHelpers.populate(objMock, populateConditionMock, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly({status: 500, message: 'Populated result was null'});
        });

        it('should error', function () {
            promiseMock.then.callsArgWith(1, errorMock);

            controllerHelpers.populate(objMock, populateConditionMock, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(errorMock);
        });
    });

    it('should updateFields', function () {
        var conditionMock = sandbox.stub();
        var originalMock = {
            _id: 'default__id',
            __v: 'default___v',
            field1: 'default1',
            field3: 'default3'
        };
        var updatedMock = {
            _id: 'new__id',
            __v: 'new___v',
            field1: 'value1',
            field2: 'value2'
        };
        var populateConditionMock = sandbox.stub();
        var execMock = sandbox.stub(controllerHelpers, 'exec');
        execMock.callsArgWith(2, originalMock);
        var saveMock = sandbox.stub(controllerHelpers, 'save');

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
        var conditionMock,
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
        var existenceCheckConditionMock = sandbox.stub();
        var objMock = sandbox.stub();
        var populateConditionMock = sandbox.stub();
        var ensureNotExistMock = sandbox.stub(controllerHelpers, 'ensureNotExist');
        ensureNotExistMock.callsArg(2);
        var saveMock = sandbox.stub(controllerHelpers, 'save');

        controllerHelpers.create(existenceCheckConditionMock, objMock, populateConditionMock, doneMock, callbackMock);

        expect(ensureNotExistMock).to.have.been.calledWithExactly(existenceCheckConditionMock, doneMock, sinon.match.func);
        expect(saveMock).to.have.been.calledWithExactly(objMock, populateConditionMock, doneMock, callbackMock);
    });
    
    describe('update', function () {
        var conditionMock,
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
            var keyFieldUpdateConditionMock = sandbox.stub();
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
        var conditionMock;
        
        beforeEach(function () {
            conditionMock = sandbox.stub();
            conditionMock = sandbox.stub();
        });
        
        var commonTests = function () {
            expect(conditionMock).to.have.been.calledWithExactly(sinon.match.func);
        };

        it('should callback', function () {
            conditionMock.callsArg(0);

            controllerHelpers.remove(conditionMock, doneMock, callbackMock);

            commonTests();
            expect(callbackMock).to.have.been.calledWithExactly();
        });

        it('should done', function () {
            conditionMock.callsArg(0);

            controllerHelpers.remove(conditionMock, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(null, {});
        });

        it('should error', function () {
            conditionMock.callsArgWith(0, errorMock);

            controllerHelpers.remove(conditionMock, doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(errorMock);
        });
    });

});
