'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);
let proxyquire = require('proxyquire');

describe('The controllers module', function() {

    it('should perform default configuration', sinon.test(function () {
        let loggerMock = this.stub();
        let modelsMock = this.stub();
        let modelHelpersMock = this.stub();

        let userAuthTokenMockModule = this.stub();
        let userAuthTokenMock = this.stub();
        userAuthTokenMockModule.withArgs(loggerMock, modelsMock).returns(userAuthTokenMock);

        let userMockModule = this.stub();
        let userMock = this.stub();
        userMockModule.withArgs(loggerMock, modelsMock).returns(userMock);

        let newsMockModule = this.stub();
        let newsMock = this.stub();
        newsMockModule.withArgs(loggerMock, modelsMock).returns(newsMock);

        let controllersMock = {
            userAuthToken: userAuthTokenMock,
            user: userMock,
            news: newsMock
        };

        let controllers = proxyquire('../../../app/controllers/controllers', {
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