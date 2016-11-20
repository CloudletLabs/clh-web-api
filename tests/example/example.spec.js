var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

describe('The example module', function() {
    it('true should be a boolean', function() {
        expect(true).to.be.a('boolean');
    });
    it('1+1 should = 2', function() {
        expect(1+1).to.equal(2);
    });
});