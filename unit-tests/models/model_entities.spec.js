'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

let newsModule = require('../../app/models/news');
let userModule = require('../../app/models/user');
let userAuthTokenModule = require('../../app/models/userAuthToken');
let userRoleModule = require('../../app/models/userRole');

describe('The entity', function() {
    let sandbox = sinon.sandbox.create();

    let modelHelpersMock,
        connectionMock,
        mongooseMock,
        schemaSpy,
        momentModuleMock,
        momentMock,
        utcMock,
        uuidMock,
        populateStub,
        expectedResult;

    beforeEach(function () {
        modelHelpersMock = sandbox.stub();
        modelHelpersMock.deleteMongoFields = sandbox.stub();

        connectionMock = sandbox.stub();
        connectionMock.model = sandbox.stub();

        mongooseMock = sandbox.stub();
        mongooseMock.Schema = function (schema) {
            this.schema = schema;
            this.methods = {};
            this.statics = {};
            mongooseMock.SchemaInstance = this;
        };

        mongooseMock.Schema.Types = sandbox.stub();
        mongooseMock.Schema.Types.ObjectId = sandbox.stub();
        schemaSpy = sandbox.spy(mongooseMock, 'Schema');

        momentModuleMock = sandbox.stub();
        momentMock = sandbox.stub();
        momentModuleMock.returns(momentMock);
        utcMock = sandbox.stub();
        momentMock.utc = sandbox.stub();
        momentMock.utc.returns(utcMock);
        utcMock.diff = sandbox.stub();
        utcMock.diff.returns(0);

        uuidMock = sandbox.stub();
        uuidMock.v1 = sandbox.stub();
        uuidMock.v1.returns('mock uuid');

        populateStub = sandbox.stub();
        populateStub.populate = sandbox.stub().returns(populateStub);

        expectedResult = function (object) {
            this.object = object;
        };
    });
    
    afterEach(function () {
        sandbox.restore();
    });
    
    function commonTests(schemaName, schema, thisModule, extraModuleArgs, extraFieldsToDelete, expectedResult, toString) {
        connectionMock.model.returns(expectedResult);
        let result = thisModule.apply(null, [modelHelpersMock, connectionMock, mongooseMock].concat(extraModuleArgs));

        expect(result).to.equals(expectedResult);
        expect(schemaSpy).to.have.been.calledWithExactly(schema);
        expect(modelHelpersMock.deleteMongoFields).to.have.been.called;
        let deleteMongoFieldsArgs = [mongooseMock.SchemaInstance];
        if (extraFieldsToDelete && extraFieldsToDelete.length > 0) {
            deleteMongoFieldsArgs.push(extraFieldsToDelete);
        }
        expect(modelHelpersMock.deleteMongoFields.args[0]).to.eql(deleteMongoFieldsArgs);
        expect(connectionMock.model).to.have.been.calledWithExactly(schemaName, mongooseMock.SchemaInstance);
        expect(result).to.eql(expectedResult);
        expect(mongooseMock.SchemaInstance.methods.toString.bind(expectedResult)()).to.eql(toString);

        if (mongooseMock.SchemaInstance.statics.defaultPopulate) {
            expect(mongooseMock.SchemaInstance.statics.defaultPopulate).to.be.a('function');
            mongooseMock.SchemaInstance.statics.defaultPopulate.apply(populateStub);
        }
    }

    describe('news', function() {
        it('should create schema', function () {
            let schema = {
                slug: {type: String, index: true, unique: true, required: true, dropDups: true},
                creator: {type: mongooseMock.Schema.Types.ObjectId, ref: 'User'},
                createDate: {type: Date, required: true, default: utcMock},
                subject: {type: String, required: true},
                text: {type: String, required: true}
            };
            expectedResult.slug = 'test slug';

            commonTests('News', schema, newsModule, [momentModuleMock], null, expectedResult, 'test slug');

            expect(populateStub.populate).to.have.been.calledWithExactly('creator', 'name');

            let generatedResult =
                mongooseMock.SchemaInstance.statics.generateNew('mock uuid', 'mock creator', 'test user agent', 'test ip');
            expect(generatedResult.object).to.eql({
                slug: 'mock uuid',
                creator: 'mock creator',
                createDate: utcMock,
                subject: 'test user agent',
                text: 'test ip'
            });
        });
    });

    describe('user', function() {
        it('should create schema', function () {
            let schema = {
                username: {type: String, index: true, unique: true, required: true, dropDups: true},
                password: {type: String, required: true},
                email: {type: String, required: true},
                name: {type: String, required: true},
                avatar: String,
                roles: [{type: mongooseMock.Schema.Types.ObjectId, ref: 'UserRole'}]
            };
            expectedResult.username = 'test username';

            commonTests('User', schema, userModule, [], ['password'], expectedResult, 'test username');

            expect(populateStub.populate).to.have.been.calledWithExactly('roles', 'roleId');

            let generatedResult =
                mongooseMock.SchemaInstance.statics.generateNew(
                    'test username', 'test password', 'test email', 'test name', 'test avatar', 'test defaultRole');
            expect(generatedResult.object).to.eql({
                username: 'test username',
                password: 'test password',
                email: 'test email',
                name: 'test name',
                avatar: 'test avatar',
                roles: ['test defaultRole']
            });
        });
    });

    describe('userAuthToken', function() {
        it('should create schema', function () {
            let schema = {
                auth_token: {type: String, index: true, unique: true, required: true, dropDups: true},
                createDate: {type: Date, required: true, default: utcMock},
                userAgent: String,
                ip: String,
                lastUsed: {type: Date, required: true, default: utcMock},
                user: {type: mongooseMock.Schema.Types.ObjectId, ref: 'User'}
            };
            expectedResult.user = {
                toString: function () {
                    return 'test token username';
                }
            };
            expectedResult.createDate = -1;

            commonTests(
                'UserAuthToken',
                schema,
                userAuthTokenModule,
                [momentModuleMock, uuidMock, 0],
                null,
                expectedResult,
                'test token username');

            expect(populateStub.populate).to.have.been.calledWithExactly('user', 'username');
            expect(populateStub.populate).to.have.been.calledWithExactly(
                { path: 'user', populate: {path: 'roles', select: 'roleId'}});

            expect(mongooseMock.SchemaInstance.methods.hasExpired.bind(expectedResult)()).to.be.false;
            expect(utcMock.diff).to.have.been.calledWithExactly(-1, 'days');
            utcMock.diff.returns(1);
            expect(mongooseMock.SchemaInstance.methods.hasExpired.bind(expectedResult)()).to.be.true;

            let generatedResult =
                mongooseMock.SchemaInstance.statics.generateNew('test user', 'test ip', 'test user agent');
            expect(generatedResult.object).to.eql({
                auth_token: 'mock uuid',
                createDate: utcMock,
                userAgent: 'test user agent',
                ip: 'test ip',
                lastUsed: utcMock,
                user: 'test user'
            });
        });
    });

    describe('userRole', function() {
        it('should create schema', function () {
            let schema = {
                roleId: {type: String, index: true, unique: true, required: true, dropDups: true},
                displayName: {type: String, required: true}
            };
            expectedResult.roleId = 'test role id';

            commonTests('UserRole', schema, userRoleModule, [], null, expectedResult, 'test role id');
        });
    });
});