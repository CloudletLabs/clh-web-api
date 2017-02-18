'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

let helper = require('../../app/config/passportHelpers');

describe('The passportHelpers module', function() {
    let sandbox = sinon.sandbox.create();
    
    let doneMock;
    
    beforeEach(function () {
        doneMock = sandbox.stub();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('authByRole', function () {
        let authByTokenMock,
            checkRoleMock;

        beforeEach(function () {
            authByTokenMock = sandbox.stub(helper, 'authByToken');
            checkRoleMock = sandbox.stub(helper, '_checkRole');
        });

        it('should auth token', function () {
            authByTokenMock.callsArgWith(5, null, { user: 'user object' });
            let UserAuthTokenMock = sandbox.stub();
            let momentMock = sandbox.stub();
            let reqMock = sandbox.stub();

            helper.authByRole(UserAuthTokenMock, momentMock, reqMock, 'token', 'role', 'done');

            expect(authByTokenMock).to.have.been.calledWithExactly(
                UserAuthTokenMock, momentMock, reqMock, 'token', true, sinon.match.func);
            expect(checkRoleMock).to.have.been.calledWithExactly('user object', 'role', 'done');
        });

        it('should fail at error in auth by role auth', function () {
            authByTokenMock.callsArgWith(5, 'test error');

            helper.authByRole(null, null, null, null, null, doneMock);

            expect(doneMock).to.have.been.calledWithExactly('test error');
        });

        it('should refuse auth by role for token', function () {
            authByTokenMock.callsArgWith(5, null, false);

            helper.authByRole(null, null, null, null, null, doneMock);

            expect(doneMock).to.have.been.calledWithExactly(null, false);
        });
    });

    describe('_checkRole', function () {
        it('should accept role', sinon.test(function () {
            let user = {
                roles: [
                    {
                        roleId: 'fake role'
                    }
                ]
            };

            helper._checkRole(user, 'fake role', doneMock);

            expect(doneMock).to.have.been.calledWithExactly(null, {
                roles: [
                    {
                        roleId: 'fake role'
                    }
                ]
            });
        }));

        it('should refuse role', sinon.test(function () {
            let user = {
                roles: [
                    {
                        roleId: 'another fake role'
                    }
                ]
            };

            helper._checkRole(user, 'fake role', doneMock);

            expect(doneMock).to.have.been.calledWithExactly(null, false);
        }));
    });

    describe('authByToken', function () {
        let
            UserAuthTokenMock,
            momentMock,
            reqMock,
            tokenMock,
            checkExpireMock,
            checkTokenMock;

        beforeEach(function () {
            UserAuthTokenMock = sandbox.stub();
            UserAuthTokenMock.findOne = sandbox.stub();
            UserAuthTokenMock.findOne.returns(UserAuthTokenMock);
            UserAuthTokenMock.populate = sandbox.stub();
            UserAuthTokenMock.populate.returns(UserAuthTokenMock);
            UserAuthTokenMock.exec = sandbox.stub();

            checkTokenMock = sandbox.stub(helper, '_checkToken');

            momentMock = sandbox.stub();
            reqMock = sandbox.stub();
            tokenMock = sandbox.stub();
            checkExpireMock = sandbox.stub();
        });

        function commonTest() {
            expect(UserAuthTokenMock.findOne).to.have.been.calledWithExactly({'auth_token': tokenMock});
            expect(UserAuthTokenMock.populate).to.have.been.calledWithExactly('user', 'username roles');
            expect(UserAuthTokenMock.exec).to.have.been.calledWithExactly(sinon.match.func);
        }

        it('should accept token', function () {
            UserAuthTokenMock.exec.callsArgWith(0, null, 'token object');

            helper.authByToken(UserAuthTokenMock, momentMock, reqMock, tokenMock, checkExpireMock, doneMock);

            commonTest();
            expect(checkTokenMock).to.have.been.calledWithExactly(
                momentMock, reqMock, 'token object', checkExpireMock, doneMock);
        });

        it('should refuse token', function () {
            UserAuthTokenMock.exec.callsArgWith(0, null, null);

            helper.authByToken(UserAuthTokenMock, momentMock, reqMock, tokenMock, checkExpireMock, doneMock);

            commonTest();
            expect(doneMock).to.have.been.calledWithExactly(null, false);
        });

        it('should fail token', function () {
            UserAuthTokenMock.exec.callsArgWith(0, 'test error', null);

            helper.authByToken(UserAuthTokenMock, momentMock, reqMock, tokenMock, checkExpireMock, doneMock);

            commonTest();
            expect(doneMock).to.have.been.calledWithExactly('test error');
        });
    });

    describe('_checkToken', function () {
        let
            userAuthTokenMock,
            momentMock,
            reqMock;
        
        beforeEach(function () {
            userAuthTokenMock = sandbox.stub();
            userAuthTokenMock.user = sandbox.stub();
            userAuthTokenMock.user.populate = sandbox.stub();
            userAuthTokenMock.hasExpired = sandbox.stub();
            userAuthTokenMock.save = sandbox.stub();
            momentMock = sandbox.stub();
            momentMock.utc = sandbox.stub();
            momentMock.utc.returns('utc');
            reqMock = sandbox.stub();
            reqMock.header = sandbox.stub();
            reqMock.header.throws();
            reqMock.header.withArgs('user-agent').returns('test user agent');
            reqMock.connection = sandbox.stub();
            reqMock.connection.remoteAddress = sandbox.stub();
        });

        it('should accept not expired token', function () {
            userAuthTokenMock.user.populate.callsArgWith(2, null);
            userAuthTokenMock.hasExpired.returns(false);
            userAuthTokenMock.userAgent = 'test user agent';
            userAuthTokenMock.save.callsArgWith(0, null, userAuthTokenMock);

            helper._checkToken(momentMock, reqMock, userAuthTokenMock, true, doneMock);

            expect(userAuthTokenMock.ip).to.be.equals(reqMock.connection.remoteAddress);
            expect(userAuthTokenMock.lastUsed).to.be.eql('utc');
            expect(userAuthTokenMock.save).to.have.been.calledWithExactly(sinon.match.func);
            expect(doneMock).to.have.been.calledWithExactly(null, userAuthTokenMock);
        });

        it('should accept expired token', function () {
            userAuthTokenMock.user.populate.callsArgWith(2, null);
            userAuthTokenMock.hasExpired.returns(true);
            userAuthTokenMock.userAgent = 'test user agent';
            userAuthTokenMock.save.callsArgWith(0, null, userAuthTokenMock);

            helper._checkToken(momentMock, reqMock, userAuthTokenMock, false, doneMock);

            expect(userAuthTokenMock.ip).to.be.equals(reqMock.connection.remoteAddress);
            expect(userAuthTokenMock.lastUsed).to.be.eql('utc');
            expect(userAuthTokenMock.save).to.have.been.calledWithExactly(sinon.match.func);
            expect(doneMock).to.have.been.calledWithExactly(null, userAuthTokenMock);
        });

        it('should refuse expired token', function () {
            userAuthTokenMock.user.populate.callsArgWith(2, null);
            userAuthTokenMock.hasExpired.returns(true);
            userAuthTokenMock.userAgent = 'test user agent';
            userAuthTokenMock.save.callsArgWith(0, null, userAuthTokenMock);

            helper._checkToken(momentMock, reqMock, userAuthTokenMock, true, doneMock);

            expect(doneMock).to.have.been.calledWithExactly(null, false);
        });

        it('should refuse token not matching user agent', function () {
            userAuthTokenMock.user.populate.callsArgWith(2, null);
            userAuthTokenMock.hasExpired.returns(false);
            userAuthTokenMock.userAgent = 'another test user agent';
            userAuthTokenMock.save.callsArgWith(0, null, userAuthTokenMock);

            helper._checkToken(momentMock, reqMock, userAuthTokenMock, true, doneMock);

            expect(doneMock).to.have.been.calledWithExactly(null, false);
        });

        it('should fail populating', function () {
            userAuthTokenMock.user.populate.callsArgWith(2, 'test population error');

            helper._checkToken(null, null, userAuthTokenMock, null, doneMock);

            expect(doneMock).to.have.been.calledWithExactly('test population error');
        });

        it('should fail saving token', function () {
            userAuthTokenMock.user.populate.callsArgWith(2, null);
            userAuthTokenMock.hasExpired.returns(false);
            userAuthTokenMock.userAgent = 'test user agent';
            userAuthTokenMock.save.callsArgWith(0, 'test save error');

            helper._checkToken(momentMock, reqMock, userAuthTokenMock, true, doneMock);

            expect(userAuthTokenMock.ip).to.be.equals(reqMock.connection.remoteAddress);
            expect(userAuthTokenMock.lastUsed).to.be.eql('utc');
            expect(userAuthTokenMock.save).to.have.been.calledWithExactly(sinon.match.func);
            expect(doneMock).to.have.been.calledWithExactly('test save error');
        });
    });
});