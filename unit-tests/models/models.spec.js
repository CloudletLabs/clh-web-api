'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);
let proxyquire = require('proxyquire');

describe('The models module', function() {

    it('should perform default configuration', sinon.test(function () {
        let modelHelpersMock = this.stub();
        let connectionMock = this.stub();
        let mongooseMock = this.stub();
        let momentMock = this.stub();
        let uuidMock = this.stub();

        let userMockModule = this.stub();
        let userMock = this.stub();
        userMockModule.withArgs(modelHelpersMock, connectionMock, mongooseMock).returns(userMock);

        let userAuthTokenMockModule = this.stub();
        let userAuthTokenMock = this.stub();
        userAuthTokenMockModule.withArgs(
            modelHelpersMock, connectionMock, mongooseMock, momentMock, uuidMock, 30).returns(userAuthTokenMock);

        let userRoleMockModule = this.stub();
        let userRoleMock = this.stub();
        userRoleMockModule.withArgs(modelHelpersMock, connectionMock, mongooseMock).returns(userRoleMock);

        let newsMockModule = this.stub();
        let newsMock = this.stub();
        newsMockModule.withArgs(modelHelpersMock, connectionMock, mongooseMock, momentMock).returns(newsMock);

        let modelsMock = {
            user: userMock,
            userAuthToken: userAuthTokenMock,
            userRole: userRoleMock,
            news: newsMock
        };

        let models = proxyquire('../../app/models/models', {
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