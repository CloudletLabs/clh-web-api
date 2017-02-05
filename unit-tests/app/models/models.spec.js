'use strict';

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);
let proxyquire = require('proxyquire');

describe('The models module', function() {

    it('should perform default configuration', sinon.test(function () {
        var modelHelpersMock = this.stub();
        var connectionMock = this.stub();
        var mongooseMock = this.stub();
        var momentMock = this.stub();
        var uuidMock = this.stub();

        var userMockModule = this.stub();
        var userMock = this.stub();
        userMockModule.withArgs(modelHelpersMock, connectionMock, mongooseMock).returns(userMock);

        var userAuthTokenMockModule = this.stub();
        var userAuthTokenMock = this.stub();
        userAuthTokenMockModule.withArgs(
            modelHelpersMock, connectionMock, mongooseMock, momentMock, uuidMock, 30).returns(userAuthTokenMock);

        var userRoleMockModule = this.stub();
        var userRoleMock = this.stub();
        userRoleMockModule.withArgs(modelHelpersMock, connectionMock, mongooseMock).returns(userRoleMock);

        var newsMockModule = this.stub();
        var newsMock = this.stub();
        newsMockModule.withArgs(modelHelpersMock, connectionMock, mongooseMock, momentMock).returns(newsMock);

        var modelsMock = {
            user: userMock,
            userAuthToken: userAuthTokenMock,
            userRole: userRoleMock,
            news: newsMock
        };

        var models = proxyquire('../../../app/models/models', {
            './user': userMockModule,
            './userAuthToken': userAuthTokenMockModule,
            './userRole': userRoleMockModule,
            './news': newsMockModule
        })(modelHelpersMock, connectionMock, mongooseMock, momentMock, uuidMock);

        expect(userMockModule).to.have.been.calledWith(modelHelpersMock, connectionMock, mongooseMock);

        expect(userAuthTokenMockModule).to.have.been.calledWith(
            modelHelpersMock, connectionMock, mongooseMock, momentMock, uuidMock, 30);

        expect(userRoleMockModule).to.have.been.calledWith(modelHelpersMock, connectionMock, mongooseMock);

        expect(newsMockModule).to.have.been.calledWith(modelHelpersMock, connectionMock, mongooseMock, momentMock);

        expect(models).to.eql(modelsMock);
    }));
});