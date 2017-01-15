var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

describe('The models module', function() {

    it('should perform default configuration', sinon.test(function () {
        var requireMock = this.stub();
        requireMock.throws();

        var modelHelpersMock = this.stub();
        var connectionMock = this.stub();
        var mongooseMock = this.stub();
        var momentMock = this.stub();
        var uuidMock = this.stub();

        var userMockModule = this.stub();
        requireMock.withArgs('../app/models/user').returns(userMockModule);
        var userMock = this.stub();
        userMockModule.withArgs(modelHelpersMock, connectionMock, mongooseMock).returns(userMock);

        var userAuthTokenMockModule = this.stub();
        requireMock.withArgs('../app/models/userAuthToken').returns(userAuthTokenMockModule);
        var userAuthTokenMock = this.stub();
        userAuthTokenMockModule.withArgs(
            modelHelpersMock, connectionMock, mongooseMock, momentMock, uuidMock, 30).returns(userAuthTokenMock);

        var userRoleMockModule = this.stub();
        requireMock.withArgs('../app/models/userRole').returns(userRoleMockModule);
        var userRoleMock = this.stub();
        userRoleMockModule.withArgs(modelHelpersMock, connectionMock, mongooseMock).returns(userRoleMock);

        var newsMockModule = this.stub();
        requireMock.withArgs('../app/models/news').returns(newsMockModule);
        var newsMock = this.stub();
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
    }));
});