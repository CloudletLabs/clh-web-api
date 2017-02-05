var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var controllerHelpers = require('../../../app/controllers/controllerHelpers');

describe('The controllerHelpers module', function() {
    var sandbox = sinon.sandbox.create();

    afterEach(function () {
        sandbox.restore();
    });

    it('should have functions', function () {
        expect(Object.keys(controllerHelpers).length).to.be.equal(11);
        expect(controllerHelpers.exec).to.be.a('function');
        expect(controllerHelpers._ensureNotExist).to.be.a('function');
        expect(controllerHelpers._save).to.be.a('function');
        expect(controllerHelpers._populate).to.be.a('function');
        expect(controllerHelpers._updateFields).to.be.a('function');
        expect(controllerHelpers._get).to.be.a('function');
        expect(controllerHelpers.getAll).to.be.a('function');
        expect(controllerHelpers.create).to.be.a('function');
        expect(controllerHelpers.get).to.be.a('function');
        expect(controllerHelpers.update).to.be.a('function');
        expect(controllerHelpers.remove).to.be.a('function');
    });
    
    describe('exec', function () {
        var conditionMock,
            doneMock,
            callbackMock,
            resultMock,
            errorMock;
        
        beforeEach(function () {
            conditionMock = sandbox.stub();
            conditionMock.exec = sandbox.stub();
            doneMock = sandbox.stub();
            callbackMock = sandbox.stub();
            resultMock = sandbox.stub();
            resultMock.toObject = sandbox.stub();
            resultMock.toObject.returns(resultMock.toObject);
            errorMock = sandbox.stub();
        });

        it('should success where result is array', function () {
            conditionMock.exec.callsArgWith(0, null, [resultMock]);

            controllerHelpers.exec(conditionMock, doneMock, null);

            expect(doneMock).to.have.been.calledWithExactly(null, [resultMock.toObject]);
        });

        it('should success where result is object', function () {
            conditionMock.exec.callsArgWith(0, null, resultMock);

            controllerHelpers.exec(conditionMock, doneMock, null);

            expect(doneMock).to.have.been.calledWithExactly(null, resultMock.toObject);
        });

        it('should success where callback is present', function () {
            conditionMock.exec.callsArgWith(0, null, resultMock);

            controllerHelpers.exec(conditionMock, doneMock, callbackMock);

            expect(callbackMock).to.have.been.calledWithExactly(resultMock);
        });

        it('should proceed when result is null', function () {
            conditionMock.exec.callsArgWith(0, null, null);

            controllerHelpers.exec(conditionMock, doneMock, null);

            expect(doneMock).to.have.been.calledWithExactly();
        });

        it('should proceed when result is undefined', function () {
            conditionMock.exec.callsArgWith(0, null, undefined);

            controllerHelpers.exec(conditionMock, doneMock, null);

            expect(doneMock).to.have.been.calledWithExactly();
        });

        it('should fail', function () {
            conditionMock.exec.callsArgWith(0, errorMock);

            controllerHelpers.exec(conditionMock, doneMock, null);

            expect(doneMock).to.have.been.calledWithExactly(errorMock);
        });
    });

    it('should _ensureNotExist', function () {
        var conditionMock = sandbox.stub();
        var callbackMock = sandbox.stub();
        var doneMock = sandbox.stub();
        var execMock = sandbox.stub(controllerHelpers, 'exec');
        execMock.callsArgWith(2, 0);

        controllerHelpers._ensureNotExist(conditionMock, callbackMock, doneMock);

        expect(execMock).to.have.been.calledWithExactly(conditionMock, doneMock, sinon.match.func);
        expect(callbackMock).to.have.been.calledWithExactly();
    });

    it('should _ensureNotExist fail', function () {
        var conditionMock = sandbox.stub();
        var doneMock = sandbox.stub();
        var execMock = sandbox.stub(controllerHelpers, 'exec');
        execMock.callsArgWith(2, 1);

        controllerHelpers._ensureNotExist(conditionMock, null, doneMock);

        expect(execMock).to.have.been.calledWithExactly(conditionMock, doneMock, sinon.match.func);
        expect(doneMock).to.have.been.calledWithExactly({status: 400, message: "Already exist"});
    });

    it('should _save', function () {
        var objMock = sandbox.stub();
        objMock.save = sandbox.stub();
        var resultMock = sandbox.stub();
        resultMock.toObject = sandbox.stub();
        var jsonMock = sandbox.stub();
        resultMock.toObject.returns(jsonMock);
        objMock.save.callsArgWith(0, null, resultMock);
        var doneMock = sandbox.stub();

        controllerHelpers._save(objMock, null, doneMock);

        expect(objMock.save).to.have.been.calledWithExactly(sinon.match.func);
        expect(doneMock).to.have.been.calledWithExactly(null, jsonMock);
    });

    it('should _save with defaultPopulate', function () {
        var objMock = sandbox.stub();
        objMock.save = sandbox.stub();
        var resultMock = sandbox.stub();
        objMock.save.callsArgWith(0, null, resultMock);
        var defaultPopulateMock = sandbox.stub();
        var populateMock = sandbox.stub(controllerHelpers, '_populate');
        var doneMock = sandbox.stub();

        controllerHelpers._save(objMock, defaultPopulateMock, doneMock);

        expect(objMock.save).to.have.been.calledWithExactly(sinon.match.func);
        expect(doneMock).to.have.not.been.called;
        expect(populateMock).to.have.been.calledWithExactly(resultMock, defaultPopulateMock, doneMock);
    });

    it('should _save fail', function () {
        var objMock = sandbox.stub();
        objMock.save = sandbox.stub();
        objMock.save.callsArgWith(0, null, null);
        var doneMock = sandbox.stub();

        controllerHelpers._save(objMock, null, doneMock);

        expect(objMock.save).to.have.been.calledWithExactly(sinon.match.func);
        expect(doneMock).to.have.been.calledWithExactly({status: 500, message: 'Saved result was null'});
    });

    it('should _save error', function () {
        var objMock = sandbox.stub();
        objMock.save = sandbox.stub();
        var errorMock = sandbox.stub();
        objMock.save.callsArgWith(0, errorMock);
        var doneMock = sandbox.stub();

        controllerHelpers._save(objMock, null, doneMock);

        expect(objMock.save).to.have.been.calledWithExactly(sinon.match.func);
        expect(doneMock).to.have.been.calledWithExactly(errorMock);
    });

    it('should _save error', function () {
        var objMock = sandbox.stub();
        objMock.defaultPopulate = sandbox.stub();
        objMock.defaultPopulate.returns(objMock);
        objMock.execPopulate = sandbox.stub();
        objMock.execPopulate.returns(objMock);
        objMock.then = sandbox.stub();

        var resultMock = sandbox.stub();
        resultMock.toObject = sandbox.stub();
        var jsonMock = sandbox.stub();
        resultMock.toObject.returns(jsonMock);
        objMock.then.callsArgWith(0, resultMock);

        var doneMock = sandbox.stub();

        controllerHelpers._populate(objMock, objMock.defaultPopulate, doneMock);

        expect(objMock.defaultPopulate).to.have.been.calledWithExactly();
        expect(objMock.execPopulate).to.have.been.calledWithExactly();
        expect(objMock.then).to.have.been.calledWithExactly(sinon.match.func, sinon.match.func);
        expect(doneMock).to.have.been.calledWithExactly(null, jsonMock);
    });

    it('should _save fail', function () {
        var objMock = sandbox.stub();
        objMock.defaultPopulate = sandbox.stub();
        objMock.defaultPopulate.returns(objMock);
        objMock.execPopulate = sandbox.stub();
        objMock.execPopulate.returns(objMock);
        objMock.then = sandbox.stub();
        objMock.then.callsArgWith(0, null);
        var doneMock = sandbox.stub();

        controllerHelpers._populate(objMock, objMock.defaultPopulate, doneMock);

        expect(objMock.defaultPopulate).to.have.been.calledWithExactly();
        expect(objMock.execPopulate).to.have.been.calledWithExactly();
        expect(objMock.then).to.have.been.calledWithExactly(sinon.match.func, sinon.match.func);
        expect(doneMock).to.have.been.calledWithExactly({status: 500, message: 'Populated result was null'});
    });

    it('should _save error', function () {
        var objMock = sandbox.stub();
        objMock.defaultPopulate = sandbox.stub();
        objMock.defaultPopulate.returns(objMock);
        objMock.execPopulate = sandbox.stub();
        objMock.execPopulate.returns(objMock);
        objMock.then = sandbox.stub();
        var errorMock = sandbox.stub();
        objMock.then.callsArgWith(1, errorMock);
        var doneMock = sandbox.stub();

        controllerHelpers._populate(objMock, objMock.defaultPopulate, doneMock);

        expect(objMock.defaultPopulate).to.have.been.calledWithExactly();
        expect(objMock.execPopulate).to.have.been.calledWithExactly();
        expect(objMock.then).to.have.been.calledWithExactly(sinon.match.func, sinon.match.func);
        expect(doneMock).to.have.been.calledWithExactly(errorMock);
    });

    it('should _updateFields', function () {
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
        var defaultPopulateMock = sandbox.stub();
        var execMock = sandbox.stub(controllerHelpers, 'exec');
        execMock.callsArgWith(2, originalMock);
        var saveMock = sandbox.stub(controllerHelpers, '_save');
        var doneMock = sandbox.stub();

        controllerHelpers._updateFields(conditionMock, updatedMock, defaultPopulateMock, doneMock);

        expect(execMock).to.have.been.calledWithExactly(conditionMock, doneMock, sinon.match.func);
        expect(saveMock).to.have.been.calledWithExactly(originalMock, defaultPopulateMock, doneMock);
        expect(originalMock).to.eql({
            _id: 'default__id',
            __v: 'default___v',
            field1: 'value1',
            field2: 'value2',
            field3: 'default3'
        });
    });

    it('should _get', function () {
        var conditionMock = sandbox.stub();
        conditionMock.defaultPopulate = sandbox.stub();
        conditionMock.defaultPopulate.returns(conditionMock);
        var resultMock = sandbox.stub();
        var execMock = sandbox.stub(controllerHelpers, 'exec');
        execMock.callsArgWith(2, resultMock);
        var resultHandlerMock = sandbox.stub();
        var doneMock = sandbox.stub();

        controllerHelpers._get(conditionMock, conditionMock.defaultPopulate, resultHandlerMock, doneMock);

        expect(conditionMock.defaultPopulate).to.have.been.calledWithExactly();
        expect(execMock).to.have.been.calledWithExactly(conditionMock, doneMock, sinon.match.func);
        expect(resultHandlerMock).to.have.been.calledWithExactly(resultMock);
    });

    it('should _get skip defaultPopulate', function () {
        var conditionMock = sandbox.stub();
        var execMock = sandbox.stub(controllerHelpers, 'exec');
        var resultHandlerMock = sandbox.stub();
        var doneMock = sandbox.stub();

        controllerHelpers._get(conditionMock, null, resultHandlerMock, doneMock);

        expect(execMock).to.have.been.calledWithExactly(conditionMock, doneMock, sinon.match.func);
    });

    it('should getAll', function () {
        var conditionMock = sandbox.stub();
        var defaultPopulateMock = sandbox.stub();
        var obj1Mock = sandbox.stub();
        obj1Mock.toObject = sandbox.stub();
        obj1Mock.toObject.returns('obj1Mock');
        var obj2Mock = sandbox.stub();
        obj2Mock.toObject = sandbox.stub();
        obj2Mock.toObject.returns('obj2Mock');
        var resultMock = [obj1Mock, obj2Mock];
        var getMock = sandbox.stub(controllerHelpers, '_get');
        getMock.callsArgWith(2, resultMock);
        var doneMock = sandbox.stub();

        controllerHelpers.getAll(conditionMock, defaultPopulateMock, doneMock);

        expect(getMock).to.have.been.calledWithExactly(conditionMock, defaultPopulateMock, sinon.match.func, doneMock);
        expect(doneMock).to.have.been.calledWithExactly(null, ['obj1Mock', 'obj2Mock']);
    });

    it('should create', function () {
        var existenceCheckConditionMock = sandbox.stub();
        var objMock = sandbox.stub();
        var defaultPopulateMock = sandbox.stub();
        var ensureNotExistMock = sandbox.stub(controllerHelpers, '_ensureNotExist');
        ensureNotExistMock.callsArg(1);
        var saveMock = sandbox.stub(controllerHelpers, '_save');
        var doneMock = sandbox.stub();

        controllerHelpers.create(existenceCheckConditionMock, objMock, defaultPopulateMock, doneMock);

        expect(ensureNotExistMock).to.have.been.calledWithExactly(existenceCheckConditionMock, sinon.match.func, doneMock);
        expect(saveMock).to.have.been.calledWithExactly(objMock, defaultPopulateMock, doneMock);
    });

    it('should get', function () {
        var conditionMock = sandbox.stub();
        var defaultPopulateMock = sandbox.stub();
        var resultMock = sandbox.stub();
        resultMock.toObject = sandbox.stub();
        var objMock = sandbox.stub();
        resultMock.toObject.returns(objMock);
        var getMock = sandbox.stub(controllerHelpers, '_get');
        getMock.callsArgWith(2, resultMock);
        var doneMock = sandbox.stub();

        controllerHelpers.get(conditionMock, defaultPopulateMock, doneMock);

        expect(getMock).to.have.been.calledWithExactly(conditionMock, defaultPopulateMock, sinon.match.func, doneMock);
        expect(doneMock).to.have.been.calledWithExactly(null, objMock);
    });

    it('should update', function () {
        var conditionMock = sandbox.stub();
        var keyFieldUpdateConditionMock = sandbox.stub();
        var updatedMock = sandbox.stub();
        var defaultPopulateMock = sandbox.stub();
        var doneMock = sandbox.stub();

        var ensureNotExistMock = sandbox.stub(controllerHelpers, '_ensureNotExist');
        ensureNotExistMock.callsArg(1);
        var updateFieldsMock = sandbox.stub(controllerHelpers, '_updateFields');

        controllerHelpers.update(conditionMock, keyFieldUpdateConditionMock, updatedMock, defaultPopulateMock, doneMock);

        expect(ensureNotExistMock).to.have.been.calledWithExactly(keyFieldUpdateConditionMock, sinon.match.func, doneMock);
        expect(updateFieldsMock).to.have.been.calledWithExactly(conditionMock, updatedMock, defaultPopulateMock, doneMock);
    });

    it('should update skip keyFieldUpdateCondition', function () {
        var conditionMock = sandbox.stub();
        var updatedMock = sandbox.stub();
        var defaultPopulateMock = sandbox.stub();
        var doneMock = sandbox.stub();

        var ensureNotExistMock = sandbox.stub(controllerHelpers, '_ensureNotExist');
        var updateFieldsMock = sandbox.stub(controllerHelpers, '_updateFields');

        controllerHelpers.update(conditionMock, null, updatedMock, defaultPopulateMock, doneMock);

        expect(ensureNotExistMock).to.not.have.been.called;
        expect(updateFieldsMock).to.have.been.calledWithExactly(conditionMock, updatedMock, defaultPopulateMock, doneMock);
    });

    it('should remove', function () {
        var conditionMock = sandbox.stub();
        conditionMock.exec = sandbox.stub();
        conditionMock.exec.callsArgWith(0, null);
        var doneMock = sandbox.stub();

        controllerHelpers.remove(conditionMock, doneMock);

        expect(conditionMock.exec).to.have.been.calledWithExactly(sinon.match.func);
        expect(doneMock).to.have.been.calledWithExactly(null, {});
    });

    it('should remove error', function () {
        var conditionMock = sandbox.stub();
        conditionMock.exec = sandbox.stub();
        var errorMock = sandbox.stub();
        conditionMock.exec.callsArgWith(0, errorMock);
        var doneMock = sandbox.stub();

        controllerHelpers.remove(conditionMock, doneMock);

        expect(conditionMock.exec).to.have.been.calledWithExactly(sinon.match.func);
        expect(doneMock).to.have.been.calledWithExactly(errorMock);
    });

});
