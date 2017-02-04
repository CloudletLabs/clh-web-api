var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var modelHelpers = require('../../../app/models/modelHelpers');

describe('The modelHelpers module', function() {

    it('should have functions', sinon.test(function () {
        expect(Object.keys(modelHelpers).length).to.be.equal(2);
        expect(modelHelpers.deleteMongoFields).to.be.a('function');
        expect(modelHelpers.exec).to.be.a('function');
    }));

    it('should delete default mongo fields', sinon.test(function () {
        var schema = {
            options: {}
        };

        modelHelpers.deleteMongoFields(schema, ['myField']);

        expect(schema.options.toObject).to.respondTo('transform');

        var object = schema.options.toObject.transform(null, {
            _id: 'id',
            __v: 'v',
            field1: 'value1',
            myField: 'value2'
        }, null);

        expect(object).to.eql({ field1: 'value1' });
    }));

    it('should exec successfully', sinon.test(function () {
        var conditionMock = this.stub();
        conditionMock.exec = this.stub();
        var resultMock = this.stub();
        conditionMock.exec.callsArgWith(0, null, resultMock);
        var resultHandlerMock = this.stub();

        modelHelpers.exec(conditionMock, resultHandlerMock, null);

        expect(resultHandlerMock).to.have.been.calledWithExactly(resultMock);
    }));

    it('should exec failed', sinon.test(function () {
        var conditionMock = this.stub();
        conditionMock.exec = this.stub();
        var doneMock = this.stub();
        var errorMock = this.stub();
        conditionMock.exec.callsArgWith(0, errorMock);

        modelHelpers.exec(conditionMock, null, doneMock);

        expect(doneMock).to.have.been.calledWithExactly(errorMock);
    }));

});
