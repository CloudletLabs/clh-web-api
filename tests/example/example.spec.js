var sinon = require('sinon');
var chai = require('chai');
var should = chai.should();

describe('The example module', function() {
    it('should handle errors', function() {
        true.should.be.a('boolean');
    })
    it('should handle errors 2', function() {
        (1+1).should.equal(2);
    })
});