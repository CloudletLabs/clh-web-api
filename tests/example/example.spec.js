var sinon = require('sinon');
var chai = require('chai');
var should = chai.should();

describe('The example module', function() {
    it('true should be a boolean', function() {
        true.should.be.a('boolean');
    })
    it('1+1 should = 2', function() {
        (1+1).should.equal(2);
    })
});