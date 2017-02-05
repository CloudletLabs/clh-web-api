'use strict';

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);
let proxyquire = require('proxyquire');

describe('The controllers module', function() {

    it('should perform default configuration', sinon.test(function () {
        var loggerMock = this.stub();
        var modelsMock = this.stub();
        var modelHelpersMock = this.stub();

        var userAuthTokenMockModule = this.stub();
        var userAuthTokenMock = this.stub();
        userAuthTokenMockModule.withArgs(loggerMock, modelsMock).returns(userAuthTokenMock);

        var userMockModule = this.stub();
        var userMock = this.stub();
        userMockModule.withArgs(loggerMock, modelsMock).returns(userMock);

        var newsMockModule = this.stub();
        var newsMock = this.stub();
        newsMockModule.withArgs(loggerMock, modelsMock).returns(newsMock);

        var controllersMock = {
            userAuthToken: userAuthTokenMock,
            user: userMock,
            news: newsMock
        };

        var controllers = proxyquire('../../../app/controllers/controllers', {
            './userAuthToken': userAuthTokenMockModule,
            './user': userMockModule,
            './news': newsMockModule
        })(loggerMock, modelsMock, modelHelpersMock);

        expect(userAuthTokenMockModule).to.have.been.calledWith(loggerMock, modelsMock, modelHelpersMock);

        expect(userMockModule).to.have.been.calledWith(loggerMock, modelsMock, modelHelpersMock);

        expect(newsMockModule).to.have.been.calledWith(loggerMock, modelsMock, modelHelpersMock);

        expect(controllers).to.eql(controllersMock);
    }));
});