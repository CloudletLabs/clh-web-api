var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var helper = require('../../../app/config/passportHelpers');

describe('The passportHelpers module', function() {
    it('should auth by role for already logged in user', sinon.test(function () {
        var helperMock = this.stub();
        helperMock._checkRole = this.stub();
        var req = { user: 'test user' };

        helper.authByRole(helperMock, req, null, 'role', 'done');

        expect(helperMock._checkRole).to.have.been.calledWithExactly(req, 'role', 'done');
    }));

    it('should auth by role for token', sinon.test(function () {
        var helperMock = this.stub();
        helperMock.authByToken = this.stub();
        helperMock.authByToken.callsArgWith(3, null, 'token object');
        helperMock._checkRole = this.stub();
        var req = { };

        helper.authByRole(helperMock, req, 'token', 'role', 'done');

        expect(req).to.eql({user: 'token object'});
        expect(helperMock.authByToken).to.have.been.calledWithExactly(req, 'token', true, sinon.match.func);
        expect(helperMock._checkRole).to.have.been.calledWithExactly(req, 'role', 'done');
    }));

    it('should fail at error in auth by role auth', sinon.test(function () {
        var helperMock = this.stub();
        helperMock.authByToken = this.stub();
        helperMock.authByToken.callsArgWith(3, 'test error');
        var doneMock = this.stub();

        helper.authByRole(helperMock, {}, null, null, doneMock);

        expect(doneMock).to.have.been.calledWithExactly('test error');
    }));

    it('should accept role', sinon.test(function () {
        var req = {
          user: {
              user: {
                  roles: [
                      {
                          roleId: 'fake role'
                      }
                  ]
              }
          }
        };
        var doneMock = this.stub();

        helper._checkRole(req, 'fake role', doneMock);

        expect(doneMock).to.have.been.calledWithExactly(null, {
            roles: [
                {
                    roleId: 'fake role'
                }
            ]
        });
    }));

    it('should refuse role', sinon.test(function () {
        var req = {
            user: {
                user: {
                    roles: [
                        {
                            roleId: 'another fake role'
                        }
                    ]
                }
            }
        };
        var doneMock = this.stub();

        helper._checkRole(req, 'fake role', doneMock);

        expect(doneMock).to.have.been.calledWithExactly(null, false);
    }));

    describe('authByToken', function () {
        var sandbox = sinon.sandbox.create();
        afterEach(function () {
            sandbox.restore();
        });

        var
            UserAuthTokenMock,
            helperMock,
            momentMock,
            reqMock,
            tokenMock,
            checkExpireMock,
            doneMock;

        beforeEach(function () {
            UserAuthTokenMock = sandbox.stub();
            UserAuthTokenMock.findOne = sandbox.stub();
            UserAuthTokenMock.findOne.returns(UserAuthTokenMock);
            UserAuthTokenMock.populate = sandbox.stub();
            UserAuthTokenMock.populate.returns(UserAuthTokenMock);
            UserAuthTokenMock.exec = sandbox.stub();

            helperMock = sandbox.stub();
            helperMock._checkToken = sandbox.stub();

            momentMock = sandbox.stub();
            reqMock = sandbox.stub();
            tokenMock = sandbox.stub();
            checkExpireMock = sandbox.stub();
            doneMock = sandbox.stub();
        });

        function commonTest() {
            expect(UserAuthTokenMock.findOne).to.have.been.calledWithExactly({'auth_token': tokenMock});
            expect(UserAuthTokenMock.populate).to.have.been.calledWithExactly('user', 'username roles');
            expect(UserAuthTokenMock.exec).to.have.been.calledWithExactly(sinon.match.func);
        }

        it('should accept token', sinon.test(function () {
            UserAuthTokenMock.exec.callsArgWith(0, null, 'token object');

            helper.authByToken(helperMock, UserAuthTokenMock, momentMock, reqMock, tokenMock, checkExpireMock, doneMock);

            commonTest();
            expect(helperMock._checkToken).to.have.been.calledWithExactly(
                momentMock, reqMock, 'token object', checkExpireMock, doneMock);
        }));

        it('should refuse token', sinon.test(function () {
            UserAuthTokenMock.exec.callsArgWith(0, null, null);

            helper.authByToken(helperMock, UserAuthTokenMock, momentMock, reqMock, tokenMock, checkExpireMock, doneMock);

            commonTest();
            expect(doneMock).to.have.been.calledWithExactly(null, false);
        }));

        it('should fail token', sinon.test(function () {
            UserAuthTokenMock.exec.callsArgWith(0, 'test error', null);

            helper.authByToken(helperMock, UserAuthTokenMock, momentMock, reqMock, tokenMock, checkExpireMock, doneMock);

            commonTest();
            expect(doneMock).to.have.been.calledWithExactly('test error');
        }));
    });

    describe('_checkToken', function () {
        var sandbox = sinon.sandbox.create();
        afterEach(function () {
            sandbox.restore();
        });

        var
            userAuthTokenMock,
            momentMock,
            reqMock,
            doneMock;
        
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
            doneMock = sandbox.stub();
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