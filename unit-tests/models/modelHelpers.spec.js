'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

let modelHelpers = require('../../app/models/modelHelpers');

describe('The modelHelpers module', function() {
    let sandbox = sinon.sandbox.create();

    afterEach(function () {
        sandbox.restore();
    });

    it('should have functions', sinon.test(function () {
        expect(Object.keys(modelHelpers).length).to.be.equal(1);
        expect(modelHelpers.deleteMongoFields).to.be.a('function');
    }));

    describe('deleteMongoFields', function () {
        let schemaMock;

        beforeEach(function () {
            schemaMock = {
                options: {
                    toObject: {}
                }
            };
        });

        it('should create options toObject', sinon.test(function () {
            let schemaMock = {
                options: {}
            };
            modelHelpers.deleteMongoFields(schemaMock);

            expect(schemaMock.options.toObject).to.respondTo('transform');
        }));

        it('should delete extra fields', sinon.test(function () {
            modelHelpers.deleteMongoFields(schemaMock, ['myField']);

            expect(schemaMock.options.toObject).to.respondTo('transform');

            let object = schemaMock.options.toObject.transform(null, {
                _id: 'id',
                __v: 'v',
                field1: 'value1',
                myField: 'value2'
            }, null);

            expect(object).to.eql({ field1: 'value1' });
        }));

        it('should delete default fields', sinon.test(function () {
            modelHelpers.deleteMongoFields(schemaMock);

            expect(schemaMock.options.toObject).to.respondTo('transform');

            let object = schemaMock.options.toObject.transform(null, {
                _id: 'id',
                __v: 'v',
                field1: 'value1',
                myField: 'value2'
            }, null);

            expect(object).to.eql({ field1: 'value1', myField: 'value2' });
        }));
    });

});
