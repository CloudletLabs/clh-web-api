'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

describe('The user controller module', function() {
    let sandbox = sinon.sandbox.create();

    let loggerMock,
        modelsMock,
        controllerHelpersMock,
        doneMock,
        controller;

    beforeEach(function () {
        loggerMock = sandbox.stub();

        modelsMock = sandbox.stub();
        modelsMock.userRole = sandbox.stub();
        modelsMock.userRole.findOne = sandbox.stub().returns(modelsMock.userRole);
        modelsMock.user = sandbox.stub();
        modelsMock.user.generateNew = sandbox.stub();
        modelsMock.user.defaultPopulate = sandbox.stub();
        modelsMock.user.find = sandbox.stub().returns(modelsMock.user);
        modelsMock.user.findOne = sandbox.stub().returns(modelsMock.user);
        modelsMock.user.count = sandbox.stub().returns(modelsMock.user);
        modelsMock.user.findOneAndRemove = sandbox.stub().returns(modelsMock.user);
        modelsMock.user.exec = sandbox.stub();

        controllerHelpersMock = sandbox.stub();
        controllerHelpersMock.populate = sandbox.stub();
        controllerHelpersMock.populateExec = sandbox.stub();
        controllerHelpersMock.create = sandbox.stub();
        controllerHelpersMock.get = sandbox.stub();
        controllerHelpersMock.update = sandbox.stub();
        controllerHelpersMock.remove = sandbox.stub();

        doneMock = sandbox.stub();

        controller = require('../../app/controllers/user')(loggerMock, modelsMock, controllerHelpersMock);
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

    it('should populate user from token', function () {
        let tokenMock = sandbox.stub();
        tokenMock.populate = sandbox.stub().returns(tokenMock);
        let execMock = sandbox.stub();
        tokenMock.execPopulate = sandbox.stub().returns(execMock);
        let populatedTokenMock = sandbox.stub();
        populatedTokenMock.user = sandbox.stub();
        controllerHelpersMock.populateExec.callsArgWith(2, populatedTokenMock);

        controller.populateFromToken(tokenMock, doneMock);

        expect(tokenMock.populate).to.have.been.calledWithExactly('user');
        expect(tokenMock.execPopulate).to.have.been.calledWithExactly();
        expect(controllerHelpersMock.populateExec).to.have.been.calledWithExactly(execMock, doneMock, sinon.match.func);
        expect(controllerHelpersMock.populate).to.have.been.calledWithExactly(
            populatedTokenMock.user, modelsMock.user.defaultPopulate, doneMock);
    });

    it('should get all users', function () {
        controller.getAll(doneMock);

        expect(modelsMock.user.find).to.have.been.calledWithExactly();
        expect(controllerHelpersMock.get).to.have.been.calledWithExactly(
            modelsMock.user, modelsMock.user.defaultPopulate, doneMock);
    });

    it('should create user', function () {
        let defaultRoleMock = sandbox.stub();
        controllerHelpersMock.get.callsArgWith(3, defaultRoleMock);

        let userJsonMock = {
            username: 'test username',
            password: 'test password',
            email: 'test email',
            name: 'test name',
            roles: ['test defaultRole']
        };
        let generatedResult = sandbox.stub();
        modelsMock.user.generateNew.returns(generatedResult);

        controller.create(userJsonMock, doneMock);

        expect(modelsMock.userRole.findOne).to.have.been.calledWith({roleId: 'USER'});
        expect(controllerHelpersMock.get).to.have.been.calledWith(modelsMock.userRole, null, doneMock, sinon.match.func);
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

        controller.get(usernameMock, doneMock);

        expect(modelsMock.user.findOne).to.have.been.calledWithExactly({username: usernameMock});
        expect(controllerHelpersMock.get).to.have.been.calledWithExactly(
            modelsMock.user, modelsMock.user.defaultPopulate, doneMock);
    });

    it('should update user with username change', function () {
        let usernameMock = sandbox.stub();
        let updatedUserMock = sandbox.stub();
        updatedUserMock.username = sandbox.stub();

        controller.update(usernameMock, updatedUserMock, doneMock);

        expect(modelsMock.user.findOne).to.have.been.calledWithExactly({username: usernameMock});
        expect(modelsMock.user.count).to.have.been.calledWithExactly({username: updatedUserMock.username});
        expect(controllerHelpersMock.update).to.have.been.calledWithExactly(
            modelsMock.user, modelsMock.user, updatedUserMock, modelsMock.user.defaultPopulate, doneMock);
    });

    it('should update user without username change', function () {
        let usernameMock = sandbox.stub();
        let updatedUserMock = sandbox.stub();

        controller.update(usernameMock, updatedUserMock, doneMock);

        expect(modelsMock.user.findOne).to.have.been.calledWithExactly({username: usernameMock});
        expect(controllerHelpersMock.update).to.have.been.calledWithExactly(
            modelsMock.user, null, updatedUserMock, modelsMock.user.defaultPopulate, doneMock);
    });

    it('should remove single user', function () {
        let usernameMock = sandbox.stub();
        let promiseMock = sandbox.stub();

        modelsMock.user.exec.returns(promiseMock);

        controller.remove(usernameMock, doneMock);

        expect(modelsMock.user.findOneAndRemove).to.have.been.calledWithExactly({username: usernameMock});
        expect(controllerHelpersMock.remove).to.have.been.calledWithExactly(promiseMock, doneMock);
    });
});