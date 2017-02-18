'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);
let proxyquire = require('proxyquire');

describe('The app module', function() {
    let sandbox = sinon.sandbox.create();

    afterEach(function () {
        sandbox.restore();
    });

    it('should configure app', function() {
        let expressMock = sandbox.stub();

        let pJsonMock = sandbox.stub();
        let appConfigMock = sandbox.stub();
        let loggerModuleMock = sandbox.stub();
        loggerModuleMock.logger = sandbox.stub();
        let appMock = sandbox.stub();
        appConfigMock.createApp = sandbox.stub().returns(appMock);
        appConfigMock.createApp.returns(appMock);
        appConfigMock.morgan = sandbox.stub();
        appConfigMock.originHeaders = sandbox.stub();
        appConfigMock.dates = sandbox.stub();
        appConfigMock.parsingMiddleware = sandbox.stub();
        appConfigMock.loggingMiddleware = sandbox.stub();
        appConfigMock.routes = sandbox.stub();
        appConfigMock.errors = sandbox.stub();

        let pathMock = sandbox.stub();
        let momentMock = sandbox.stub();
        let uuidMock = sandbox.stub();

        let mongooseMock = sandbox.stub();
        let databaseModuleMock = sandbox.stub();
        let connectionMock = sandbox.stub();
        databaseModuleMock.returns(connectionMock);
        let modelHelpersMock = sandbox.stub();
        let modelsModuleMock = sandbox.stub();
        let modelsMock = sandbox.stub();
        modelsModuleMock.returns(modelsMock);
        let modelDefaultTestDataHelperMock = sandbox.stub();
        modelDefaultTestDataHelperMock.check = sandbox.stub();

        let controllerHelpersMock = sandbox.stub();
        let controllersModuleMock = sandbox.stub();
        let controllersMock = sandbox.stub();
        controllersModuleMock.returns(controllersMock);

        let morganMock = sandbox.stub();

        let passportMock = sandbox.stub();
        let passportHttpMock = sandbox.stub();
        passportHttpMock.BasicStrategy = sandbox.stub();
        let passportHttpBearerMock = sandbox.stub();
        passportHttpBearerMock.Strategy = sandbox.stub();
        let passportHelpersMock = sandbox.stub();
        let passportConfigMock = sandbox.stub();

        let cookieParserMock = sandbox.stub();
        let bodyParserMock = sandbox.stub();

        let apiHandlersMock = sandbox.stub();
        let v1ApiMock = sandbox.stub();

        let app = proxyquire('../app', {
            'express': expressMock,
            './package.json': pJsonMock,
            './app/config': appConfigMock,
            './app/logger': loggerModuleMock,
            'path': pathMock,
            'moment/moment': momentMock,
            'uuid': uuidMock,
            'mongoose': mongooseMock,
            './app/config/database': databaseModuleMock,
            './app/models/modelHelpers': modelHelpersMock,
            './app/models/models': modelsModuleMock,
            './app/models/modelDefaultTestDataHelper': modelDefaultTestDataHelperMock,
            './app/controllers/controllerHelpers': controllerHelpersMock,
            './app/controllers/controllers': controllersModuleMock,
            'morgan': morganMock,
            'passport': passportMock,
            'passport-http': passportHttpMock,
            'passport-http-bearer': passportHttpBearerMock,
            './app/config/passportHelpers': passportHelpersMock,
            './app/config/passport': passportConfigMock,
            'cookie-parser': cookieParserMock,
            'body-parser': bodyParserMock,
            './app/routes/api/apiHandlers': apiHandlersMock,
            './app/routes/api/v1/api': v1ApiMock
        });

        expect(appConfigMock.createApp).to.have.been.calledWithExactly(expressMock);

        expect(databaseModuleMock).to.have.been.calledWithExactly(mongooseMock);
        expect(modelsModuleMock).to.have.been.calledWithExactly(
            modelHelpersMock, connectionMock, mongooseMock, momentMock, uuidMock);
        expect(modelDefaultTestDataHelperMock.check).to.have.been.calledWithExactly(modelsMock);

        expect(controllersModuleMock).to.have.been.calledWithExactly(
            loggerModuleMock.logger, modelsMock, controllerHelpersMock);

        expect(appConfigMock.morgan).to.have.been.calledWithExactly(appMock, morganMock);

        expect(appConfigMock.originHeaders).to.have.been.calledWithExactly(appMock);

        expect(appConfigMock.dates).to.have.been.calledWithExactly(appMock);

        expect(passportConfigMock).to.have.been.calledWithExactly(
            passportMock,
            passportHelpersMock,
            modelsMock,
            momentMock,
            passportHttpMock.BasicStrategy,
            passportHttpBearerMock.Strategy);

        expect(appConfigMock.parsingMiddleware).to.have.been.calledWithExactly(
            appMock, cookieParserMock, bodyParserMock);

        expect(appConfigMock.loggingMiddleware).to.have.been.calledWithExactly(appMock, loggerModuleMock);

        expect(appConfigMock.routes).to.have.been.calledWithExactly(
            appMock, pJsonMock, expressMock, pathMock, loggerModuleMock.logger,
            apiHandlersMock, v1ApiMock, passportMock, controllersMock);

        expect(appConfigMock.errors).to.have.been.calledWithExactly(appMock);

        expect(app).to.equal(appMock);
    });
});