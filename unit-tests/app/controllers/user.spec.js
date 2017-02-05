'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

describe('The user controller module', function() {
    let sandbox = sinon.sandbox.create();

    let loggerMock,
        defaultRoleMock,
        modelsMock,
        controllerHelpersMock,
        doneMock,
        controller;

    beforeEach(function () {
        loggerMock = sandbox.stub();

        defaultRoleMock = sandbox.stub();
        modelsMock = sandbox.stub();
        modelsMock.userRole = sandbox.stub();
        modelsMock.userRole.findOne = sandbox.stub();
        modelsMock.userRole.findOne.callsArgWith(1, null, defaultRoleMock);
        modelsMock.user = sandbox.stub();
        modelsMock.user.defaultPopulate = sandbox.stub();

        controllerHelpersMock = sandbox.stub();
        controllerHelpersMock.populate = sandbox.stub();
        controllerHelpersMock.create = sandbox.stub();
        controllerHelpersMock.get = sandbox.stub();
        controllerHelpersMock.update = sandbox.stub();
        controllerHelpersMock.remove = sandbox.stub();

        doneMock = sandbox.stub();

        controller = require('../../../app/controllers/user')(loggerMock, modelsMock, controllerHelpersMock);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should return functions', function () {
        expect(Object.keys(controller).length).to.be.equal(6);
        expect(controller.populateFromToken).to.be.a('function');
        expect(controller.getAll).to.be.a('function');
        expect(controller.create).to.be.a('function');
        expect(controller.get).to.be.a('function');
        expect(controller.update).to.be.a('function');
        expect(controller.remove).to.be.a('function');
    });

    it('should error on getting default role', function () {
        modelsMock.userRole.findOne.callsArgWith(1, new Error('test error'));
        let fn = function () {
            require('../../../app/controllers/user')(loggerMock, modelsMock, controllerHelpersMock);
        };
        expect(fn).to.throw(Error, /test error/);
    });

    it('should error on not getting default role', function () {
        modelsMock.userRole.findOne.callsArgWith(1, null, null);
        let fn = function () {
            require('../../../app/controllers/user')(loggerMock, modelsMock, controllerHelpersMock);
        };
        expect(fn).to.throw(Error, /Default USER role not found/);
    });

    it('should populate user from token', function () {
        let tokenMock = sandbox.stub();
        let populateConditionMock = sandbox.stub();
        tokenMock.populate = sandbox.stub().returns(populateConditionMock);
        let populatedTokenMock = sandbox.stub();
        populatedTokenMock.user = sandbox.stub();
        controllerHelpersMock.populate.onFirstCall().callsArgWith(3, populatedTokenMock);

        controller.populateFromToken(tokenMock, doneMock);

        expect(tokenMock.populate).to.have.been.calledWithExactly('user');
        expect(controllerHelpersMock.populate).to.have.been.calledWithExactly(
            tokenMock, populateConditionMock, doneMock, sinon.match.func);
        expect(controllerHelpersMock.populate).to.have.been.calledWithExactly(
            populatedTokenMock.user, modelsMock.user.defaultPopulate, doneMock);
    });

    it('should get all users', function () {
        modelsMock.user.find = sandbox.stub();
        modelsMock.user.find.returns(modelsMock.user);

        controller.getAll(doneMock);

        expect(modelsMock.user.find).to.have.been.calledWithExactly();
        expect(controllerHelpersMock.get).to.have.been.calledWithExactly(
            modelsMock.user, modelsMock.user.defaultPopulate, doneMock);
    });

    it('should create user', function () {
        let userJsonMock = {
            username: 'test username',
            password: 'test password',
            email: 'test email',
            name: 'test name',
            roles: ['test defaultRole']
        };
        let generatedResult = sandbox.stub();

        modelsMock.user.generateNew = sandbox.stub();
        modelsMock.user.generateNew.returns(generatedResult);

        modelsMock.user.count = sandbox.stub();
        modelsMock.user.count.returns(modelsMock.user);

        controller.create(userJsonMock, doneMock);

        expect(modelsMock.user.generateNew).to.have.been.calledWith(
            userJsonMock.username,
            userJsonMock.password,
            userJsonMock.email,
            userJsonMock.name,
            'img/mockUser2.jpg',
            defaultRoleMock);
        expect(modelsMock.user.count).to.have.been.calledWithExactly({username: userJsonMock.username});
        expect(controllerHelpersMock.create).to.have.been.calledWithExactly(
            modelsMock.user,
            generatedResult,
            modelsMock.user.defaultPopulate, doneMock);
    });

    it('should get single user', function () {
        let usernameMock = sandbox.stub();

        modelsMock.user.findOne = sandbox.stub();
        modelsMock.user.findOne.returns(modelsMock.user);

        controller.get(usernameMock, doneMock);

        expect(modelsMock.user.findOne).to.have.been.calledWithExactly({username: usernameMock});
        expect(controllerHelpersMock.get).to.have.been.calledWithExactly(
            modelsMock.user, modelsMock.user.defaultPopulate, doneMock);
    });

    it('should remove single user', function () {
        let usernameMock = sandbox.stub();

        modelsMock.user.findOneAndRemove = sandbox.stub();
        modelsMock.user.findOneAndRemove.returns(modelsMock.user);
        modelsMock.user.exec = sandbox.stub();

        controller.remove(usernameMock, doneMock);

        expect(modelsMock.user.findOneAndRemove).to.have.been.calledWithExactly({username: usernameMock});
        expect(controllerHelpersMock.remove).to.have.been.calledWithExactly(modelsMock.user.exec, doneMock);
    });
});