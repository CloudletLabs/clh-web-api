var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

describe('The app module', function() {

    it('should configure app', function() {
        var requireMock = sinon.stub();
        requireMock.throws();

        var pJsonMock = sinon.stub();
        requireMock.withArgs('../package.json').returns(pJsonMock);

        var appConfigMock = sinon.stub();
        requireMock.withArgs('../app/config').returns(appConfigMock);

        var pathMock = sinon.stub();
        requireMock.withArgs('path').returns(pathMock);

        var momentMock = sinon.stub();
        requireMock.withArgs('moment').returns(momentMock);

        var uuidMock = sinon.stub();
        requireMock.withArgs('node-uuid').returns(uuidMock);

        var mongooseMock = sinon.stub();
        requireMock.withArgs('mongoose').returns(mongooseMock);

        var connectionConfigMock = sinon.stub();
        requireMock.withArgs('../app/config/database').returns(connectionConfigMock);
        var connectionMock = sinon.stub();
        connectionConfigMock.withArgs(mongooseMock).returns(connectionMock);

        var modelsConfigMock = sinon.stub();
        requireMock.withArgs('../app/models/models').returns(modelsConfigMock);
        var modelsMock = sinon.stub();
        modelsConfigMock.withArgs(requireMock, connectionMock, mongooseMock, momentMock, uuidMock).returns(modelsMock);

        var expressMock = sinon.stub();
        requireMock.withArgs('express').returns(expressMock);

        var morganMock = sinon.stub();
        requireMock.withArgs('morgan').returns(morganMock);

        var passportMock = sinon.stub();
        requireMock.withArgs('passport').returns(passportMock);

        var passportHttpMock = sinon.stub();
        var BasicStrategyMock = sinon.stub();
        passportHttpMock.BasicStrategy = BasicStrategyMock;
        requireMock.withArgs('passport-http').returns(passportHttpMock);

        var passportHttpBearerMock = sinon.stub();
        var BearerStrategyMock = sinon.stub();
        passportHttpBearerMock.Strategy = BearerStrategyMock;
        requireMock.withArgs('passport-http-bearer').returns(passportHttpBearerMock);

        var passportConfigMock = sinon.stub();
        requireMock.withArgs('../app/config/passport').returns(passportConfigMock);

        var cookieParserMock = sinon.stub();
        requireMock.withArgs('cookie-parser').returns(cookieParserMock);

        var bodyParserMock = sinon.stub();
        requireMock.withArgs('body-parser').returns(bodyParserMock);

        var apiHandlersMock = sinon.stub();
        requireMock.withArgs('../app/routes/api/apiHandlers').returns(apiHandlersMock);

        var v1ApiMock = sinon.stub();
        requireMock.withArgs('../app/routes/api/v1/api').returns(v1ApiMock);

        var appMock = sinon.stub();

        appConfigMock.createApp = sinon.stub().returns(appMock);
        appConfigMock.createApp.withArgs(expressMock).returns(appMock);
        appConfigMock.morgan = sinon.stub();
        appConfigMock.originHeader = sinon.stub();
        appConfigMock.parsingMiddleware = sinon.stub();
        appConfigMock.routes = sinon.stub();
        appConfigMock.errors = sinon.stub();

        var app = require('../app')(requireMock);

        expect(requireMock).to.have.been.calledWith('../package.json');
        expect(requireMock).to.have.been.calledWith('../app/config');

        expect(requireMock).to.have.been.calledWith('path');
        expect(requireMock).to.have.been.calledWith('moment');
        expect(requireMock).to.have.been.calledWith('node-uuid');

        expect(requireMock).to.have.been.calledWith('mongoose');
        expect(requireMock).to.have.been.calledWith('../app/config/database');
        expect(connectionConfigMock).to.have.been.calledWith(mongooseMock);
        expect(requireMock).to.have.been.calledWith('../app/models/models');
        expect(modelsConfigMock).to.have.been.calledWith(requireMock, connectionMock, mongooseMock, momentMock, uuidMock);

        expect(requireMock).to.have.been.calledWith('express');
        expect(appConfigMock.createApp).to.have.been.calledWith(expressMock);

        expect(requireMock).to.have.been.calledWith('morgan');
        expect(appConfigMock.morgan).to.have.been.calledWith(appMock, morganMock);

        expect(appConfigMock.originHeader).to.have.been.calledWith(appMock);

        expect(requireMock).to.have.been.calledWith('passport');
        expect(requireMock).to.have.been.calledWith('../app/config/passport');
        expect(passportConfigMock).to.have.been.calledWith(
            passportMock, modelsMock, momentMock, BasicStrategyMock, BearerStrategyMock);

        expect(requireMock).to.have.been.calledWith('cookie-parser');
        expect(requireMock).to.have.been.calledWith('body-parser');
        expect(appConfigMock.parsingMiddleware).to.have.been.calledWith(appMock, cookieParserMock, bodyParserMock);

        expect(requireMock).to.have.been.calledWith('../app/routes/api/apiHandlers');
        expect(requireMock).to.have.been.calledWith('../app/routes/api/v1/api');
        expect(appConfigMock.routes).to.have.been.calledWith(
            appMock, pJsonMock, expressMock, pathMock, apiHandlersMock, v1ApiMock, passportMock, modelsMock);

        expect(appConfigMock.errors).to.have.been.calledWith(appMock);

        expect(app).to.equal(appMock);
    });
});