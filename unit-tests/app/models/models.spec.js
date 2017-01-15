var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

describe('The models module', function() {

    it('should perform default configuration', function () {
        var requireMock = sinon.stub();
        requireMock.throws();

        var modelHelpersMock = sinon.stub();
        var connectionMock = sinon.stub();
        var mongooseMock = sinon.stub();
        var momentMock = sinon.stub();
        var uuidMock = sinon.stub();

        var userMockModule = sinon.stub();
        requireMock.withArgs('../app/models/user').returns(userMockModule);
        var userMock = sinon.stub();
        userMockModule.withArgs(modelHelpersMock, connectionMock, mongooseMock).returns(userMock);

        var userAuthTokenMockModule = sinon.stub();
        requireMock.withArgs('../app/models/userAuthToken').returns(userAuthTokenMockModule);
        var userAuthTokenMock = sinon.stub();
        userAuthTokenMockModule.withArgs(
            modelHelpersMock, connectionMock, mongooseMock, momentMock, uuidMock, 30).returns(userAuthTokenMock);

        var userRoleMockModule = sinon.stub();
        requireMock.withArgs('../app/models/userRole').returns(userRoleMockModule);
        var userRoleMock = sinon.stub();
        userRoleMockModule.withArgs(modelHelpersMock, connectionMock, mongooseMock).returns(userRoleMock);

        var newsMockModule = sinon.stub();
        requireMock.withArgs('../app/models/news').returns(newsMockModule);
        var newsMock = sinon.stub();
        newsMockModule.withArgs(modelHelpersMock, connectionMock, mongooseMock, momentMock).returns(newsMock);

        var modelsMock = {
            user: userMock,
            userAuthToken: userAuthTokenMock,
            userRole: userRoleMock,
            news: newsMock
        };

        var models = require('../../../app/models/models')
        (requireMock, modelHelpersMock, connectionMock, mongooseMock, momentMock, uuidMock);

        expect(requireMock).to.have.been.calledWith('../app/models/user');
        expect(userMockModule).to.have.been.calledWith(modelHelpersMock, connectionMock, mongooseMock);

        expect(requireMock).to.have.been.calledWith('../app/models/userAuthToken');
        expect(userAuthTokenMockModule).to.have.been.calledWith(
            modelHelpersMock, connectionMock, mongooseMock, momentMock, uuidMock, 30);

        expect(requireMock).to.have.been.calledWith('../app/models/userRole');
        expect(userRoleMockModule).to.have.been.calledWith(modelHelpersMock, connectionMock, mongooseMock);

        expect(requireMock).to.have.been.calledWith('../app/models/news');
        expect(newsMockModule).to.have.been.calledWith(modelHelpersMock, connectionMock, mongooseMock, momentMock);

        expect(models).to.eql(modelsMock);
    });
});