var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var passportModule = require('../../../app/config/passport');

describe('The passport module', function() {
    var
        sandbox,
        passportMock,
        strategies,
        passportHelpersMock,
        userAuthTokenMock,
        userMock,
        modelsMock,
        momentMock,
        BasicStrategyMock,
        BearerStrategy;
    
    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        passportMock = sandbox.stub();
        strategies = {};
        passportMock.use = function (name, strategy) {
            strategies[name] = strategy;
        };
        passportHelpersMock = sandbox.stub();
        passportHelpersMock.authByRole = sandbox.stub();
        passportHelpersMock.checkRole = sandbox.stub();
        passportHelpersMock.authByToken = sandbox.stub();
        userAuthTokenMock = sandbox.stub();
        userMock = sandbox.stub();
        modelsMock = sandbox.stub();
        modelsMock.userAuthToken = userAuthTokenMock;
        modelsMock.user = userMock;
        momentMock = sandbox.stub();
        BasicStrategyMock = function (strategy) {
            this.strategy = strategy;
        };
        BearerStrategy = function (config, strategy) {
            this.config = config;
            this.strategy = strategy;
        };

        passportModule(passportMock, passportHelpersMock, modelsMock, momentMock, BasicStrategyMock, BearerStrategy);
    });

    afterEach(function () {
        sandbox.restore();
    });
    
    it('should perform default configuration', function () {
        expect(Object.keys(strategies)).to.eql(['basic-authentication',
            'bearer-authentication',
            'bearer-renew-authentication',
            'user-authorization',
            'admin-authorization']);
        expect(strategies['basic-authentication'].strategy).to.be.a.function;
        expect(strategies['bearer-authentication'].config).to.eql({passReqToCallback: true});
        expect(strategies['bearer-authentication'].strategy).to.be.a.function;
        expect(strategies['bearer-renew-authentication'].config).to.eql({passReqToCallback: true});
        expect(strategies['bearer-renew-authentication'].strategy).to.be.a.function;
        expect(strategies['user-authorization'].config).to.eql({passReqToCallback: true});
        expect(strategies['user-authorization'].strategy).to.be.a.function;
        expect(strategies['admin-authorization'].config).to.eql({passReqToCallback: true});
        expect(strategies['admin-authorization'].strategy).to.be.a.function;
    });

    it('should succeed basic auth', function () {
        var doneMock = sandbox.stub();
        userMock.findOne = sandbox.stub();
        userMock.findOne.callsArgWith(1, null, 'test user');

        strategies['basic-authentication'].strategy('test username', 'test password', doneMock);

        expect(userMock.findOne).to.have.been.calledWithExactly({
            username: 'test username',
            password: 'test password'
        }, sinon.match.func);
        expect(doneMock).to.have.been.calledWithExactly(null, 'test user');
    });

    it('should fail basic auth', function () {
        var doneMock = sandbox.stub();
        userMock.findOne = sandbox.stub();
        userMock.findOne.callsArgWith(1, null, null);

        strategies['basic-authentication'].strategy('test username', 'test password', doneMock);

        expect(userMock.findOne).to.have.been.calledWithExactly({
            username: 'test username',
            password: 'test password'
        }, sinon.match.func);
        expect(doneMock).to.have.been.calledWithExactly(null, false);
    });

    it('should error basic auth', function () {
        var doneMock = sandbox.stub();
        userMock.findOne = sandbox.stub();
        userMock.findOne.callsArgWith(1, 'test error');

        strategies['basic-authentication'].strategy('test username', 'test password', doneMock);

        expect(userMock.findOne).to.have.been.calledWithExactly({
            username: 'test username',
            password: 'test password'
        }, sinon.match.func);
        expect(doneMock).to.have.been.calledWithExactly('test error');
    });

    it('should perform bearer-authentication', function () {
        strategies['bearer-authentication'].strategy('test req', 'test token', 'test done');

        expect(passportHelpersMock.authByToken).to.have.been.calledWithExactly(
            userAuthTokenMock, 'test req', 'test token', true, 'test done');
    });

    it('should perform bearer-renew-authentication', function () {
        strategies['bearer-renew-authentication'].strategy('test req', 'test token', 'test done');

        expect(passportHelpersMock.authByToken).to.have.been.calledWithExactly(
            userAuthTokenMock, 'test req', 'test token', false, 'test done');
    });

    it('should perform user-authorization', function () {
        strategies['user-authorization'].strategy('test req', 'test token', 'test done');

        expect(passportHelpersMock.authByRole).to.have.been.calledWithExactly(
            passportHelpersMock, 'test req', 'test token', 'USER', 'test done');
    });

    it('should perform admin-authorization', function () {
        strategies['admin-authorization'].strategy('test req', 'test token', 'test done');

        expect(passportHelpersMock.authByRole).to.have.been.calledWithExactly(
            passportHelpersMock, 'test req', 'test token', 'ADMIN', 'test done');
    });
});