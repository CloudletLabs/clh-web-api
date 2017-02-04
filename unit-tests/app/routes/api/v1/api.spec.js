var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var apiModule = require('../../../../../app/routes/api/v1/api');

describe('The v1/api module', function() {
    var sandbox = sinon.sandbox.create();
    var expressMock,
        routerMock,
        appMock,
        pJsonMock,
        loggerMock,
        apiHandlersMock,
        passportMock,
        controllersMock,
        sendResMock,
        reqMock,
        resMock,
        nextMock;
    var defaultPassportConfig = { session: false };
    var api;

    beforeEach(function () {
        expressMock = sandbox.stub();
        expressMock.Router = sandbox.stub();

        routerMock = sandbox.stub();
        var apiMethod = function(method) {
            return function (url, arg1, arg2) {
                if (!this.methodsCount) this.methodsCount = 0;
                this.methodsCount++;
                if (!this[method]) this[method] = {};
                this[method][url] = [arg1];
                if (arg2) this[method][url].push(arg2);
            }
        };
        routerMock.get = apiMethod('get');
        routerMock.post = apiMethod('post');
        routerMock.put = apiMethod('put');
        routerMock.delete = apiMethod('delete');
        expressMock.Router.returns(routerMock);

        appMock = sandbox.stub();
        pJsonMock = sandbox.stub();
        loggerMock = sandbox.stub();

        apiHandlersMock = sandbox.stub();
        apiHandlersMock.sendRes = sandbox.stub();
        apiHandlersMock.sendRes.returns(sendResMock);

        passportMock = sandbox.stub();
        passportMock.authenticate = function (name, config) {
            return [name, config];
        };
        passportMock.authorize = passportMock.authenticate;

        controllersMock = sandbox.stub();
        controllersMock.userAuthToken = sandbox.stub();
        controllersMock.user = sandbox.stub();
        controllersMock.news = sandbox.stub();

        reqMock = sandbox.stub();
        reqMock.account = sandbox.stub();
        reqMock.account.user = sandbox.stub();
        reqMock.user = sandbox.stub();
        reqMock.connection = sandbox.stub();
        reqMock.connection.remoteAddress = sandbox.stub();
        reqMock.header = sandbox.stub();
        reqMock.header.returnsArg(0);
        reqMock.params = sandbox.stub();
        reqMock.body = sandbox.stub();
        resMock = sandbox.stub();
        nextMock = sandbox.stub();

        api = apiModule(expressMock, appMock, pJsonMock, loggerMock, apiHandlersMock, passportMock, controllersMock);
    });

    afterEach(function () {
        api = null;
        sandbox.restore();
    });

    it('should configure routes', function () {
        expect(api.pJson).to.equals(pJsonMock);
        expect(api.apiVersion).to.eql('1');
        expect(api.router).to.equals(routerMock);
        expect(api.router.methodsCount).to.be.eql(14);
    });

    describe('methods', function () {
        var commonApiMethodTest = function (method, url, passportName) {
            var controllerFunc;
            if (passportName) {
                expect(api.router[method][url].length).to.be.eql(2);
                expect(api.router[method][url][0]).to.be.eql([passportName, defaultPassportConfig]);
                controllerFunc = api.router[method][url][1];
            } else {
                expect(api.router[method][url].length).to.be.eql(1);
                controllerFunc = api.router[method][url][0];
            }
            expect(controllerFunc).to.be.a('function');
            controllerFunc(reqMock, resMock, nextMock);
            expect(apiHandlersMock.sendRes).to.have.been.calledWithExactly(resMock, nextMock);
        };
        
        it('should configure POST /auth_token', function () {
            controllersMock.userAuthToken.generateNew = sandbox.stub();

            commonApiMethodTest('post', '/auth_token', 'basic-authentication');

            expect(controllersMock.userAuthToken.generateNew).to.have.been.calledWithExactly(
                reqMock.account,
                reqMock.connection.remoteAddress,
                'user-agent',
                sendResMock
            );
        });

        it('should configure PUT /auth_token', function () {
            controllersMock.userAuthToken.renew = sandbox.stub();

            commonApiMethodTest('put', '/auth_token', 'bearer-renew-authentication');

            expect(controllersMock.userAuthToken.renew).to.have.been.calledWithExactly(
                reqMock.account,
                sendResMock
            );
        });

        it('should configure DELETE /auth_token/:token', function () {
            controllersMock.userAuthToken.delete = sandbox.stub();
            reqMock.params.token = sandbox.stub();

            commonApiMethodTest('delete', '/auth_token/:token', 'bearer-authentication');

            expect(controllersMock.userAuthToken.delete).to.have.been.calledWithExactly(
                reqMock.account.user,
                reqMock.params.token,
                sendResMock
            );
        });

        it('should configure GET /user', function () {
            controllersMock.user.populateFromToken = sandbox.stub();

            commonApiMethodTest('get', '/user', 'bearer-authentication');

            expect(controllersMock.user.populateFromToken).to.have.been.calledWithExactly(
                reqMock.account,
                sendResMock
            );
        });

        it('should configure GET /users', function () {
            controllersMock.user.getAll = sandbox.stub();

            commonApiMethodTest('get', '/users', 'admin-authorization');

            expect(controllersMock.user.getAll).to.have.been.calledWithExactly(
                sendResMock
            );
        });

        it('should configure POST /users', function () {
            controllersMock.user.create = sandbox.stub();

            commonApiMethodTest('post', '/users');

            expect(controllersMock.user.create).to.have.been.calledWithExactly(
                reqMock.body,
                sendResMock
            );
        });

        it('should configure GET /users/:username', function () {
            controllersMock.user.get = sandbox.stub();
            reqMock.params.username = sandbox.stub();

            commonApiMethodTest('get', '/users/:username', 'admin-authorization');

            expect(controllersMock.user.get).to.have.been.calledWithExactly(
                reqMock.params.username,
                sendResMock
            );
        });

        it('should configure PUT /users/:username', function () {
            controllersMock.user.update = sandbox.stub();
            reqMock.params.username = sandbox.stub();

            commonApiMethodTest('put', '/users/:username', 'admin-authorization');

            expect(controllersMock.user.update).to.have.been.calledWithExactly(
                reqMock.params.username,
                reqMock.body,
                sendResMock
            );
        });

        it('should configure DELETE /users/:username', function () {
            controllersMock.user.remove = sandbox.stub();
            reqMock.params.username = sandbox.stub();

            commonApiMethodTest('delete', '/users/:username', 'admin-authorization');

            expect(controllersMock.user.remove).to.have.been.calledWithExactly(
                reqMock.params.username,
                sendResMock
            );
        });

        it('should configure GET /news', function () {
            controllersMock.news.getAll = sandbox.stub();

            commonApiMethodTest('get', '/news');

            expect(controllersMock.news.getAll).to.have.been.calledWithExactly(
                sendResMock
            );
        });

        it('should configure POST /news', function () {
            controllersMock.news.create = sandbox.stub();

            commonApiMethodTest('post', '/news', 'admin-authorization');

            expect(controllersMock.news.create).to.have.been.calledWithExactly(
                reqMock.account,
                reqMock.body,
                sendResMock
            );
        });

        it('should configure GET /news/:slug', function () {
            controllersMock.news.get = sandbox.stub();
            reqMock.params.slug = sandbox.stub();

            commonApiMethodTest('get', '/news/:slug');

            expect(controllersMock.news.get).to.have.been.calledWithExactly(
                reqMock.params.slug,
                sendResMock
            );
        });

        it('should configure PUT /news/:slug', function () {
            controllersMock.news.update = sandbox.stub();
            reqMock.params.slug = sandbox.stub();

            commonApiMethodTest('put', '/news/:slug', 'admin-authorization');

            expect(controllersMock.news.update).to.have.been.calledWithExactly(
                reqMock.params.slug,
                reqMock.body,
                sendResMock
            );
        });

        it('should configure DELETE /news/:slug', function () {
            controllersMock.news.remove = sandbox.stub();
            reqMock.params.slug = sandbox.stub();

            commonApiMethodTest('delete', '/news/:slug', 'admin-authorization');

            expect(controllersMock.news.remove).to.have.been.calledWithExactly(
                reqMock.params.slug,
                sendResMock
            );
        });
    });
});