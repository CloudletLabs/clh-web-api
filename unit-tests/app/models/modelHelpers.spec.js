var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var modelHelpers = require('../../../app/models/modelHelpers');

describe('The modelHelpers module', function() {

    it('should have functions', sinon.test(function () {
        expect(Object.keys(modelHelpers).length).to.be.equal(1);
        expect(modelHelpers.deleteMongoFields).to.be.a('function');
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

});
