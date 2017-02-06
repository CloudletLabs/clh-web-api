'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);
let proxyquire = require('proxyquire');

describe('The app module', function() {

    it('should configure app', sinon.test(function() {
        let expressMock = this.stub();

        let pJsonMock = this.stub();
        let appConfigMock = this.stub();
        let loggerModuleMock = this.stub();
        loggerModuleMock.logger = this.stub();
        let appMock = this.stub();
        appConfigMock.createApp = this.stub().returns(appMock);
        appConfigMock.createApp.returns(appMock);
        appConfigMock.morgan = this.stub();
        appConfigMock.originHeaders = this.stub();
        appConfigMock.parsingMiddleware = this.stub();
        appConfigMock.loggingMiddleware = this.stub();
        appConfigMock.routes = this.stub();
        appConfigMock.errors = this.stub();

        let pathMock = this.stub();
        let momentMock = this.stub();
        let uuidMock = this.stub();

        let mongooseMock = this.stub();
        let databaseModuleMock = this.stub();
        let connectionMock = this.stub();
        databaseModuleMock.returns(connectionMock);
        let modelHelpersMock = this.stub();
        let modelsModuleMock = this.stub();
        let modelsMock = this.stub();
        modelsModuleMock.returns(modelsMock);
        let modelDefaultTestDataHelperMock = this.stub();
        modelDefaultTestDataHelperMock.check = this.stub();

        let controllerHelpersMock = this.stub();
        let controllersModuleMock = this.stub();
        let controllersMock = this.stub();
        controllersModuleMock.returns(controllersMock);

        let morganMock = this.stub();

        let passportMock = this.stub();
        let passportHttpMock = this.stub();
        passportHttpMock.BasicStrategy = this.stub();
        let passportHttpBearerMock = this.stub();
        passportHttpBearerMock.Strategy = this.stub();
        let passportHelpersMock = this.stub();
        let passportConfigMock = this.stub();

        let cookieParserMock = this.stub();
        let bodyParserMock = this.stub();

        let apiHandlersMock = this.stub();
        let v1ApiMock = this.stub();

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
    }));
});