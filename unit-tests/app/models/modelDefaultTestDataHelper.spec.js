var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var helper = require('../../../app/models/modelDefaultTestDataHelper');

describe('The helper module', function() {

    it('should have functions', sinon.test(function () {
        expect(Object.keys(helper).length).to.be.equal(8);
        expect(helper.check).to.be.a('function');
        expect(helper._getResultsName).to.be.a('function');
        expect(helper._check).to.be.a('function');
        expect(helper._getExisting).to.be.a('function');
        expect(helper._createDefaultData).to.be.a('function');
        expect(helper._createDefaultUserRoles).to.be.a('function');
        expect(helper._createDefaultUsers).to.be.a('function');
        expect(helper._createDefaultNews).to.be.a('function');
    }));

    it('should check default test data', sinon.test(function () {
        var modelsMock = {
            user: this.stub(),
            userAuthToken: this.stub(),
            userRole: this.stub(),
            news: this.stub()
        };
        modelsMock.user.modelName = 'users';
        modelsMock.userRole.modelName = 'userRoles';
        modelsMock.news.modelName = 'newss';

        var checkSpy = this.stub(helper, '_check', function (helper, model, results, createDefaultCallback, next) {
            results[model.modelName] = [model.modelName];
            next(results);
        });
        var consoleWarn = this.stub(console, 'warn');

        helper.check(modelsMock);

        expect(checkSpy).to.have.been.callCount(3);
        expect(checkSpy).to.have.been.calledWith(
            helper,
            modelsMock.userRole,
            sinon.match({}),
            helper._createDefaultUserRoles,
            sinon.match.func);
        expect(checkSpy).to.have.been.calledWith(
            helper,
            modelsMock.user,
            sinon.match({
                userRoles: ['userRoles']
            }),
            helper._createDefaultUsers,
            sinon.match.func);
        expect(checkSpy).to.have.been.calledWith(
            helper,
            modelsMock.news,
            sinon.match({
                userRoles: ['userRoles'],
                users: ['users']
            }),
            helper._createDefaultNews,
            sinon.match.func);
        expect(consoleWarn).to.have.been.calledWith('Default test data has been created: %s',
            ["userRoles:1", "users:1", "newss:1"]);
    }));


    it('should get results name', sinon.test(function () {
        var name = helper._getResultsName('MyModelName');
        expect(name).to.be.eql('myModelNames');
    }));


    it('should create default model data', sinon.test(function () {
        var modelMock = {
            count: function (next) {
                next(null, 0);
            }
        };
        var resultsMock = this.stub();
        var createDefaultCallbackMock = this.stub();
        createDefaultCallbackMock.returns('data to create');
        var nextMock = this.stub();
        var createDefaultDataMock = this.stub(helper, '_createDefaultData');
        var getExistingMock = this.stub(helper, '_getExisting');

        helper._check(helper, modelMock, resultsMock, createDefaultCallbackMock, nextMock);

        expect(createDefaultCallbackMock).to.have.been.calledWith(resultsMock);
        expect(createDefaultDataMock).to.have.been.calledWith(helper, modelMock, resultsMock, 'data to create', nextMock);
        expect(getExistingMock).not.to.have.been.called;
    }));


    it('should fetch existing model data', sinon.test(function () {
        var modelMock = {
            count: function (next) {
                next(null, 1);
            }
        };
        var createDefaultCallbackMock = this.stub();
        var nextMock = this.stub();
        var getExistingMock = this.stub(helper, '_getExisting');

        helper._check(helper, modelMock, null, null, nextMock);

        expect(createDefaultCallbackMock).not.to.have.been.called;
        expect(getExistingMock).to.have.been.calledWith(helper, modelMock, nextMock);
    }));

    it('should throw error on checking model data', sinon.test(function () {
        var modelMock = {
            count: function (next) {
                next('test error');
            }
        };
        var createDefaultCallbackMock = this.stub();
        var getExistingMock = this.stub(helper, '_getExisting');

        expect(helper._check.bind(helper, helper, modelMock, null, null, null)).to.throw('test error');
        expect(createDefaultCallbackMock).not.to.have.been.called;
        expect(getExistingMock).not.to.have.been.called;
    }));

    it('should fetch model data', sinon.test(function () {
        var result = this.stub();
        var modelMock = {
            find: function (next) {
                next(null, result);
            },
            modelName: 'test model name'
        };
        var getResultsName = this.stub(helper, '_getResultsName').returns('test name');
        var results = {
            'already existing data': 'test data'
        };
        var next = this.stub();

        helper._getExisting(helper, modelMock, results, next);

        expect(getResultsName).to.have.been.calledWith('test model name');
        expect(results).to.eql({
            'already existing data': 'test data',
            'test name': result
        });
    }));

    it('should throw error on fetching model data', sinon.test(function () {
        var modelMock = {
            find: function (next) {
                next('test error');
            }
        };

        expect(helper._getExisting.bind(helper, helper, modelMock, null, null)).to.throw('test error');
    }));

    it('should create default data', sinon.test(function () {
        var getResultsNameMock = this.stub(helper, '_getResultsName').returns('results name');
        var data = [
            'data1',
            'data2'
        ];
        exports.MyModule = function(data) {
            this.data = data;
        };
        exports.MyModule.prototype.save = function (next) {
            next(null, this);
        };
        var modelMock = this.spy(exports, 'MyModule');
        var modelSave = this.spy(exports.MyModule.prototype, 'save');
        modelMock.modelName = 'model name';
        var results = {
            'already existing data': 'test data'
        };
        var nextMock = this.stub();
        var consoleWarn = this.stub(console, 'warn');

        helper._createDefaultData(helper, exports.MyModule, results, data, nextMock);

        expect(getResultsNameMock).to.have.been.calledWith('model name');
        expect(consoleWarn).to.have.been.calledWith('Creating default %s', 'results name');
        expect(modelMock).to.have.been.calledTwice;
        expect(modelMock).to.have.been.calledWith('data1');
        expect(modelMock).to.have.been.calledWith('data2');
        expect(modelSave).to.have.been.calledTwice;
        expect(consoleWarn).to.have.been.calledWith('New %s %s created', 'model name', { data: "data1" });
        expect(consoleWarn).to.have.been.calledWith('New %s %s created', 'model name', { data: "data2" });
        expect(nextMock).to.have.been.calledWith({
            'already existing data': 'test data',
            'results name': [
                { data: "data1" },
                { data: "data2" }
            ]
        });
    }));

    it('should create default user roles', sinon.test(function () {
        var userRoles = helper._createDefaultUserRoles(null);
        expect(userRoles).to.eql([
            {roleId: "ADMIN", displayName: "Administrator"},
            {roleId: "USER", displayName: "User"}
        ]);
    }));

    it('should create default users', sinon.test(function () {
        var results = {
            userRoles: [
                'role1',
                'role2'
            ]
        };
        var users = helper._createDefaultUsers(results);
        expect(users).to.eql([
            {
                username: 'admin',
                password: '28564878b1cbe4544ccfafaaa33b5326d8290e320e31c868f66de0128e73079b',
                email: 'admin@example.com',
                name: 'Admin',
                avatar: 'img/mockUser.jpg',
                roles: results.userRoles
            },
            {
                username: 'user',
                password: '720bb2073cb1961d26404ba1f5fe3f4d83b183bf72b8f7328c51f132b3c362db',
                email: 'user@example.com',
                name: 'User',
                avatar: 'img/mockUser2.jpg',
                roles: [results.userRoles[1]]
            }
        ]);
    }));

    it('should create default news', sinon.test(function () {
        var results = {
            users: [
                'user1',
                'user2'
            ]
        };
        var users = helper._createDefaultNews(results);
        expect(users).to.eql([
            {
                slug: 'hello-world',
                creator: results.users[0],
                createDate: Date(2017, 1, 1, 0, 0, 0, 0),
                subject: 'Hello World!',
                text: '**This** is a **first** test news! `Welcome!`'
            },
            {
                slug: 'second-news',
                creator: results.users[0],
                createDate: Date(2017, 1, 2, 0, 0, 0, 0),
                subject: 'Second News',
                text: 'This is a second test news!'
            }
        ]);
    }));
});
