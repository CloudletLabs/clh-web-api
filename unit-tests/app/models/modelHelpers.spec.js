var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

describe('The modelHelpers module', function() {

    it('should delete default mongo fields', function () {
        schema = {
            options: {}
        };

        var modelHelpers = require('../../../app/models/modelHelpers');
        modelHelpers.deleteMongoFields(schema, ['myField']);

        expect(schema.options.toObject).to.respondTo('transform');

        var object = schema.options.toObject.transform(null, {
            _id: 'id',
            __v: 'v',
            field1: 'value1',
            myField: 'value2'
        }, null);

        expect(object).to.eql({ field1: 'value1' });
    });

});
