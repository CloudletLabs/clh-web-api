'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

let passportModule = require('../../../app/config/passport');

describe('The passport module', function() {
    let sandbox = sinon.sandbox.create();

    let passportMock,
        strategies,
        passportHelpersMock,
        userAuthTokenMock,
        userMock,
        modelsMock,
        momentMock,
        BasicStrategyMock,
        BearerStrategyMock,
        doneMock;
    
    beforeEach(function () {
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
        userMock.findOne = sandbox.stub();
        modelsMock = sandbox.stub();
        modelsMock.userAuthToken = userAuthTokenMock;
        modelsMock.user = userMock;
        momentMock = sandbox.stub();
        BasicStrategyMock = function (strategy) {
            this.strategy = strategy;
        };
        BearerStrategyMock = function (config, strategy) {
            this.config = config;
            this.strategy = strategy;
        };

        doneMock = sandbox.stub();

        passportModule(passportMock, passportHelpersMock, modelsMock, momentMock, BasicStrategyMock, BearerStrategyMock);
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
    
    describe('basic-authentication', function () {
        var commonTests = function () {
            expect(userMock.findOne).to.have.been.calledWithExactly({
                username: 'test username',
                password: 'test password'
            }, sinon.match.func);
        };

        it('should succeed', function () {
            userMock.findOne.callsArgWith(1, null, 'test user');

            strategies['basic-authentication'].strategy('test username', 'test password', doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(null, 'test user');
        });

        it('should fail', function () {
            userMock.findOne.callsArgWith(1, null, null);

            strategies['basic-authentication'].strategy('test username', 'test password', doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly(null, false);
        });

        it('should error', function () {
            userMock.findOne.callsArgWith(1, 'test error');

            strategies['basic-authentication'].strategy('test username', 'test password', doneMock);

            commonTests();
            expect(doneMock).to.have.been.calledWithExactly('test error');
        });
    });

    it('should perform bearer-authentication', function () {
        strategies['bearer-authentication'].strategy('test req', 'test token', 'test done');

        expect(passportHelpersMock.authByToken).to.have.been.calledWithExactly(
            userAuthTokenMock, momentMock, 'test req', 'test token', true, 'test done');
    });

    it('should perform bearer-renew-authentication', function () {
        strategies['bearer-renew-authentication'].strategy('test req', 'test token', 'test done');

        expect(passportHelpersMock.authByToken).to.have.been.calledWithExactly(
            userAuthTokenMock, momentMock, 'test req', 'test token', false, 'test done');
    });

    it('should perform user-authorization', function () {
        strategies['user-authorization'].strategy('test req', 'test token', 'test done');

        expect(passportHelpersMock.authByRole).to.have.been.calledWithExactly(
            userAuthTokenMock, momentMock, 'test req', 'test token', 'USER', 'test done');
    });

    it('should perform admin-authorization', function () {
        strategies['admin-authorization'].strategy('test req', 'test token', 'test done');

        expect(passportHelpersMock.authByRole).to.have.been.calledWithExactly(
            userAuthTokenMock, momentMock, 'test req', 'test token', 'ADMIN', 'test done');
    });
});