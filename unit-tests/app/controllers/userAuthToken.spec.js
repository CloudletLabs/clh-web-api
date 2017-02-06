'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

describe('The userAuthToken controller module', function() {
    let sandbox = sinon.sandbox.create();

    let loggerMock,
        modelsMock,
        controllerHelpersMock,
        doneMock,
        controller;

    beforeEach(function () {
        loggerMock = sandbox.stub();

        modelsMock = sandbox.stub();
        modelsMock.userAuthToken = sandbox.stub();
        modelsMock.userAuthToken.generateNew = sandbox.stub();
        modelsMock.userAuthToken.count = sandbox.stub().returns(modelsMock.userAuthToken);
        modelsMock.userAuthToken.populate = sandbox.stub().returns(modelsMock.userAuthToken);
        modelsMock.userAuthToken.findOne = sandbox.stub().returns(modelsMock.userAuthToken);

        controllerHelpersMock = sandbox.stub();
        controllerHelpersMock.exec = sandbox.stub();
        controllerHelpersMock.create = sandbox.stub();
        controllerHelpersMock.remove = sandbox.stub();

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
        let generatedResult = sandbox.stub();
        generatedResult.auth_token = sandbox.stub();
        modelsMock.userAuthToken.generateNew.returns(generatedResult);

        controller.generateNew('test user', 'test ip', 'test userAgent', doneMock);

        expect(modelsMock.userAuthToken.generateNew).to.have.been.calledWith('test user', 'test ip', 'test userAgent');
        expect(modelsMock.userAuthToken.count).to.have.been.calledWithExactly({auth_token: generatedResult.auth_token});
        expect(controllerHelpersMock.create).to.have.been.calledWithExactly(
            modelsMock.userAuthToken,
            generatedResult,
            modelsMock.userAuthToken.defaultPopulate, doneMock);
    });

    it('should regenerate', function () {
        let promiseMock = sandbox.stub();
        let tokenMock = {
            user: 'test user',
            ip: 'test ip',
            userAgent: 'test userAgent',
            remove: sandbox.stub().returns(promiseMock)
        };
        let generatedResult = sandbox.stub();
        generatedResult.auth_token = sandbox.stub();
        modelsMock.userAuthToken.generateNew.returns(generatedResult);
        let createdTokenMock = sandbox.stub();
        let objectMock = sandbox.stub();
        createdTokenMock.toObject = sandbox.stub().returns(objectMock);

        controllerHelpersMock.create.callsArgWith(4, createdTokenMock);
        controllerHelpersMock.remove.callsArg(2);

        controller.renew(tokenMock, doneMock);

        expect(modelsMock.userAuthToken.generateNew).to.have.been.calledWith('test user', 'test ip', 'test userAgent');
        expect(modelsMock.userAuthToken.count).to.have.been.calledWithExactly({auth_token: generatedResult.auth_token});
        expect(controllerHelpersMock.create).to.have.been.calledWithExactly(
            modelsMock.userAuthToken,
            generatedResult,
            modelsMock.userAuthToken.defaultPopulate, doneMock, sinon.match.func);
        expect(controllerHelpersMock.remove).to.have.been.calledWithExactly(promiseMock, doneMock, sinon.match.func);
        expect(doneMock).to.have.been.calledWithExactly(null, objectMock);
    });

    it('should delete', function () {
        let userMock = {
            username: 'test username'
        };
        let tokenMock = sandbox.stub();

        let promiseMock = sandbox.stub();
        let tokenObjectMock = {
            user: {
                username: 'test username'
            },
            remove: sandbox.stub().returns(promiseMock)
        };
        controllerHelpersMock.exec.callsArgWith(2, tokenObjectMock);

        controller.delete(userMock, tokenMock, doneMock);

        expect(modelsMock.userAuthToken.findOne).to.have.been.calledWithExactly({auth_token: tokenMock});
        expect(modelsMock.userAuthToken.populate).to.have.been.calledWithExactly('user', 'username');
        expect(controllerHelpersMock.exec).to.have.been.calledWithExactly(modelsMock.userAuthToken, doneMock, sinon.match.func);
        expect(controllerHelpersMock.remove).to.have.been.calledWithExactly(promiseMock, doneMock);
    });

    it('should not delete if token not belongs to the user', function () {
        let userMock = {
            username: 'test username'
        };
        let tokenMock = sandbox.stub();

        let tokenObjectMock = {
            user: {
                username: 'test username2'
            },
            remove: sandbox.stub()
        };
        controllerHelpersMock.exec.callsArgWith(2, tokenObjectMock);

        controller.delete(userMock, tokenMock, doneMock);

        expect(modelsMock.userAuthToken.findOne).to.have.been.calledWithExactly({auth_token: tokenMock});
        expect(modelsMock.userAuthToken.populate).to.have.been.calledWithExactly('user', 'username');
        expect(controllerHelpersMock.exec).to.have.been.calledWithExactly(modelsMock.userAuthToken, doneMock, sinon.match.func);
        expect(controllerHelpersMock.remove).to.have.not.been.called;
        expect(doneMock).to.have.been.calledWithExactly();
    });
});