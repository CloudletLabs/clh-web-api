var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

describe('The userAuthToken controller module', function() {
    var sandbox = sinon.sandbox.create();

    var loggerMock,
        modelsMock,
        controllerHelpersMock,
        doneMock,
        controller;

    beforeEach(function () {
        loggerMock = sandbox.stub();

        modelsMock = sandbox.stub();
        modelsMock.userAuthToken = sandbox.stub();

        controllerHelpersMock = sandbox.stub();
        controllerHelpersMock.create = sandbox.stub();

        doneMock = sandbox.stub();

        controller = require('../../../app/controllers/userAuthToken')(loggerMock, modelsMock, controllerHelpersMock);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should return functions', function () {
        expect(Object.keys(controller).length).to.be.equal(3);
        expect(controller.generateNew).to.be.a('function');
        expect(controller.renew).to.be.a('function');
        expect(controller.delete).to.be.a('function');
    });

    it('should generate new', function () {
        var generatedResult = sandbox.stub();
        generatedResult.auth_token = sandbox.stub();

        modelsMock.userAuthToken.count = sandbox.stub();
        modelsMock.userAuthToken.count.returns(modelsMock.userAuthToken);

        modelsMock.userAuthToken.generateNew = sandbox.stub();
        modelsMock.userAuthToken.generateNew.returns(generatedResult);

        controller.generateNew('test user', 'test ip', 'test userAgent', doneMock);

        expect(modelsMock.userAuthToken.generateNew).to.have.been.calledWith('test user', 'test ip', 'test userAgent');
        expect(modelsMock.userAuthToken.count).to.have.been.calledWithExactly({auth_token: generatedResult.auth_token});
        expect(controllerHelpersMock.create).to.have.been.calledWithExactly(
            modelsMock.userAuthToken,
            generatedResult,
            modelsMock.userAuthToken.defaultPopulate, doneMock);
    });
});