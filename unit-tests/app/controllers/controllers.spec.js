var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

describe('The controllers module', function() {

    it('should perform default configuration', sinon.test(function () {
        var requireMock = this.stub();
        requireMock.throws();

        var loggerMock = this.stub();
        var modelsMock = this.stub();

        var userAuthTokenMockModule = this.stub();
        requireMock.withArgs('../app/controllers/userAuthToken').returns(userAuthTokenMockModule);
        var userAuthTokenMock = this.stub();
        userAuthTokenMockModule.withArgs(loggerMock, modelsMock).returns(userAuthTokenMock);

        var userMockModule = this.stub();
        requireMock.withArgs('../app/controllers/user').returns(userMockModule);
        var userMock = this.stub();
        userMockModule.withArgs(loggerMock, modelsMock).returns(userMock);

        var newsMockModule = this.stub();
        requireMock.withArgs('../app/controllers/news').returns(newsMockModule);
        var newsMock = this.stub();
        newsMockModule.withArgs(loggerMock, modelsMock).returns(newsMock);

        var controllersMock = {
            userAuthToken: userAuthTokenMock,
            user: userMock,
            news: newsMock
        };

        var controllers = require('../../../app/controllers/controllers')(requireMock, loggerMock, modelsMock);

        expect(requireMock).to.have.been.calledWith('../app/controllers/userAuthToken');
        expect(userAuthTokenMockModule).to.have.been.calledWith(loggerMock, modelsMock);

        expect(requireMock).to.have.been.calledWith('../app/controllers/user');
        expect(userMockModule).to.have.been.calledWith(loggerMock, modelsMock);

        expect(requireMock).to.have.been.calledWith('../app/controllers/news');
        expect(newsMockModule).to.have.been.calledWith(loggerMock, modelsMock);

        expect(controllers).to.eql(controllersMock);
    }));
});