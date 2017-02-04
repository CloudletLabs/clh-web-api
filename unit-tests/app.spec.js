var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

describe('The app module', function() {

    it('should configure app', sinon.test(function() {
        var requireMock = this.stub();
        requireMock.throws();

        var pJsonMock = this.stub();
        requireMock.withArgs('../package.json').returns(pJsonMock);

        var appConfigMock = this.stub();
        requireMock.withArgs('../app/config').returns(appConfigMock);

        var loggerModuleMock = this.stub();
        var loggerMock = this.stub();
        requireMock.withArgs('../app/logger').returns(loggerModuleMock);
        loggerModuleMock.log = this.stub();
        loggerModuleMock.log.returns(loggerMock);

        var pathMock = this.stub();
        requireMock.withArgs('path').returns(pathMock);

        var momentMock = this.stub();
        requireMock.withArgs('moment').returns(momentMock);

        var uuidMock = this.stub();
        requireMock.withArgs('node-uuid').returns(uuidMock);

        var mongooseMock = this.stub();
        requireMock.withArgs('mongoose').returns(mongooseMock);

        var connectionConfigMock = this.stub();
        requireMock.withArgs('../app/config/database').returns(connectionConfigMock);
        var connectionMock = this.stub();
        connectionConfigMock.withArgs(mongooseMock).returns(connectionMock);

        var modelHelpersMock = this.stub();
        requireMock.withArgs('../app/models/modelHelpers').returns(modelHelpersMock);
        var modelsConfigMock = this.stub();
        requireMock.withArgs('../app/models/models').returns(modelsConfigMock);
        var modelsMock = this.stub();
        modelsConfigMock.withArgs(
            requireMock, modelHelpersMock, connectionMock, mongooseMock, momentMock, uuidMock).returns(modelsMock);
        var modelDefaultTestDataHelperMock = this.stub();
        requireMock.withArgs('../app/models/modelDefaultTestDataHelper').returns(modelDefaultTestDataHelperMock);
        modelDefaultTestDataHelperMock.check = this.stub();
        modelDefaultTestDataHelperMock.check.withArgs(modelsMock, momentMock);

        var controllersModuleMock = this.stub();
        requireMock.withArgs('../app/controllers/controllers').returns(controllersModuleMock);
        var controllersMock = this.stub();
        controllersModuleMock.returns(controllersMock);

        var expressMock = this.stub();
        requireMock.withArgs('express').returns(expressMock);

        var morganMock = this.stub();
        requireMock.withArgs('morgan').returns(morganMock);

        var passportMock = this.stub();
        requireMock.withArgs('passport').returns(passportMock);

        var passportHttpMock = this.stub();
        var BasicStrategyMock = this.stub();
        passportHttpMock.BasicStrategy = BasicStrategyMock;
        requireMock.withArgs('passport-http').returns(passportHttpMock);

        var passportHttpBearerMock = this.stub();
        var BearerStrategyMock = this.stub();
        passportHttpBearerMock.Strategy = BearerStrategyMock;
        requireMock.withArgs('passport-http-bearer').returns(passportHttpBearerMock);

        var passportHelpersMock = this.stub();
        requireMock.withArgs('../app/config/passportHelpers').returns(passportHelpersMock);

        var passportConfigMock = this.stub();
        requireMock.withArgs('../app/config/passport').returns(passportConfigMock);

        var cookieParserMock = this.stub();
        requireMock.withArgs('cookie-parser').returns(cookieParserMock);

        var bodyParserMock = this.stub();
        requireMock.withArgs('body-parser').returns(bodyParserMock);

        var apiHandlersMock = this.stub();
        requireMock.withArgs('../app/routes/api/apiHandlers').returns(apiHandlersMock);

        var v1ApiMock = this.stub();
        requireMock.withArgs('../app/routes/api/v1/api').returns(v1ApiMock);

        var appMock = this.stub();

        appConfigMock.createApp = this.stub().returns(appMock);
        appConfigMock.createApp.withArgs(expressMock).returns(appMock);
        appConfigMock.morgan = this.stub();
        appConfigMock.originHeaders = this.stub();
        appConfigMock.parsingMiddleware = this.stub();
        appConfigMock.loggingMiddleware = this.stub();
        appConfigMock.routes = this.stub();
        appConfigMock.errors = this.stub();

        var app = require('../app')(requireMock);

        expect(requireMock).to.have.been.calledWithExactly('../package.json');
        expect(requireMock).to.have.been.calledWithExactly('../app/config');
        expect(requireMock).to.have.been.calledWithExactly('../app/logger');
        expect(loggerModuleMock.log).to.have.been.called;

        expect(requireMock).to.have.been.calledWithExactly('path');
        expect(requireMock).to.have.been.calledWithExactly('moment');
        expect(requireMock).to.have.been.calledWithExactly('node-uuid');

        expect(requireMock).to.have.been.calledWithExactly('mongoose');
        expect(requireMock).to.have.been.calledWithExactly('../app/config/database');
        expect(connectionConfigMock).to.have.been.calledWithExactly(mongooseMock);
        expect(requireMock).to.have.been.calledWithExactly('../app/models/modelHelpers');
        expect(requireMock).to.have.been.calledWithExactly('../app/models/models');
        expect(modelsConfigMock).to.have.been.calledWithExactly(
            requireMock, modelHelpersMock, connectionMock, mongooseMock, momentMock, uuidMock);
        expect(requireMock).to.have.been.calledWithExactly('../app/models/modelDefaultTestDataHelper');
        expect(modelDefaultTestDataHelperMock.check).to.have.been.calledWithExactly(modelsMock, momentMock);

        expect(requireMock).to.have.been.calledWithExactly('../app/controllers/controllers');
        expect(controllersModuleMock).to.have.been.calledWithExactly(requireMock, loggerMock, modelsMock, modelHelpersMock);

        expect(requireMock).to.have.been.calledWithExactly('express');
        expect(appConfigMock.createApp).to.have.been.calledWithExactly(expressMock);

        expect(requireMock).to.have.been.calledWithExactly('morgan');
        expect(appConfigMock.morgan).to.have.been.calledWithExactly(appMock, morganMock);

        expect(appConfigMock.originHeaders).to.have.been.calledWithExactly(appMock);

        expect(requireMock).to.have.been.calledWithExactly('passport');
        expect(requireMock).to.have.been.calledWithExactly('../app/config/passport');
        expect(requireMock).to.have.been.calledWithExactly('../app/config/passportHelpers');
        expect(passportConfigMock).to.have.been.calledWithExactly(
            passportMock, passportHelpersMock, modelsMock, momentMock, BasicStrategyMock, BearerStrategyMock);

        expect(requireMock).to.have.been.calledWithExactly('cookie-parser');
        expect(requireMock).to.have.been.calledWithExactly('body-parser');
        expect(appConfigMock.parsingMiddleware).to.have.been.calledWithExactly(appMock, cookieParserMock, bodyParserMock);

        expect(appConfigMock.loggingMiddleware).to.have.been.calledWithExactly(appMock, loggerModuleMock);

        expect(requireMock).to.have.been.calledWithExactly('../app/routes/api/apiHandlers');
        expect(requireMock).to.have.been.calledWithExactly('../app/routes/api/v1/api');
        expect(appConfigMock.routes).to.have.been.calledWithExactly(
            appMock, pJsonMock, expressMock, pathMock, loggerMock,
            apiHandlersMock, v1ApiMock, passportMock, controllersMock);

        expect(appConfigMock.errors).to.have.been.calledWithExactly(appMock);

        expect(app).to.equal(appMock);
    }));
});