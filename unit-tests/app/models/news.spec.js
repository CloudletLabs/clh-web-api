var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var newsModule = require('../../../app/models/news');

describe('The news module', function() {
    it('should create schema', sinon.test(function () {
        var modelHelpersMock = this.stub();
        modelHelpersMock.deleteMongoFields = this.stub();

        var connectionMock = this.stub();
        connectionMock.model = this.stub();
        connectionMock.model.returns('model');

        var mongooseMock = this.stub();
        mongooseMock.Schema = function (schema) {
            this.schema = schema;
            this.methods = {};
        };
        mongooseMock.Schema.Types = this.stub();
        mongooseMock.Schema.Types.ObjectId = this.stub();
        var schemaSpy = this.spy(mongooseMock, 'Schema');

        var momentMock = this.stub();
        var utcMock = this.stub();
        utcMock.utc = this.stub();
        momentMock.returns(utcMock);
        utcMock.utc.returns('utc');

        var schema = {
            slug: {type: String, index: true, unique: true, required: true, dropDups: true},
            creator: {type: mongooseMock.Schema.Types.ObjectId, ref: 'User'},
            createDate: {type: Date, required: true, default: 'utc'},
            subject: {type: String, required: true},
            text: {type: String, required: true}
        };

        var newSchema = {
            schema: schema,
            methods: {
                toString: sinon.match.func
            }
        };

        var result = newsModule(modelHelpersMock, connectionMock, mongooseMock, momentMock);

        expect(schemaSpy).to.have.been.calledWith(schema);
        expect(modelHelpersMock.deleteMongoFields).to.have.been.calledWith(newSchema);
        expect(connectionMock.model).to.have.been.calledWith('News', newSchema);
        expect(result).to.eql('model');
        expect(modelHelpersMock.deleteMongoFields.args[0][0].methods.toString.bind(
            {slug: 'test slug'})()).to.eql('test slug');
    }));
});