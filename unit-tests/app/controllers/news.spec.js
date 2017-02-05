'use strict';

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

describe('The news controller module', function() {
    var sandbox = sinon.sandbox.create();

    var loggerMock,
        modelsMock,
        controllerHelpersMock,
        doneMock,
        controller;

    beforeEach(function () {
        loggerMock = sandbox.stub();

        modelsMock = sandbox.stub();
        modelsMock.news = sandbox.stub();
        modelsMock.news.defaultPopulate = sandbox.stub();

        controllerHelpersMock = sandbox.stub();
        controllerHelpersMock.create = sandbox.stub();
        controllerHelpersMock.get = sandbox.stub();
        controllerHelpersMock.update = sandbox.stub();
        controllerHelpersMock.remove = sandbox.stub();

        doneMock = sandbox.stub();

        controller = require('../../../app/controllers/news')(loggerMock, modelsMock, controllerHelpersMock);
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should return functions', function () {
        expect(Object.keys(controller).length).to.be.equal(5);
        expect(controller.getAll).to.be.a('function');
        expect(controller.create).to.be.a('function');
        expect(controller.get).to.be.a('function');
        expect(controller.update).to.be.a('function');
        expect(controller.remove).to.be.a('function');
    });

    it('should get all news', function () {
        modelsMock.news.find = sandbox.stub();
        modelsMock.news.find.returns(modelsMock.news);

        modelsMock.news.sort = sandbox.stub();
        modelsMock.news.sort.returns(modelsMock.news);

        controller.getAll(doneMock);

        expect(modelsMock.news.find).to.have.been.calledWithExactly();
        expect(modelsMock.news.sort).to.have.been.calledWithExactly({createDate: 'desc'});
        expect(controllerHelpersMock.get).to.have.been.calledWithExactly(
            modelsMock.news, modelsMock.news.defaultPopulate, doneMock);
    });

    it('should create news', function () {
        var creatorMock = sandbox.stub();
        var newsJsonMock = {
            slug: 'test slug',
            subject: 'test subject',
            text: 'test text'
        };
        var savedNews = sandbox.stub();

        modelsMock.news.generateNew = sandbox.stub();
        modelsMock.news.generateNew.returns(savedNews);

        modelsMock.news.count = sandbox.stub();
        modelsMock.news.count.returns(modelsMock.news);

        controller.create(creatorMock, newsJsonMock, doneMock);

        expect(modelsMock.news.generateNew).to.have.been.calledWithExactly(
            'test slug', creatorMock, 'test subject', 'test text');
        expect(modelsMock.news.count).to.have.been.calledWithExactly({slug: 'test slug'});
        expect(controllerHelpersMock.create).to.have.been.calledWithExactly(
            modelsMock.news, savedNews, modelsMock.news.defaultPopulate, doneMock);
    });

    it('should get single news', function () {
        var slugMock = sandbox.stub();

        modelsMock.news.findOne = sandbox.stub();
        modelsMock.news.findOne.returns(modelsMock.news);

        controller.get(slugMock, doneMock);

        expect(modelsMock.news.findOne).to.have.been.calledWithExactly({slug: slugMock});
        expect(controllerHelpersMock.get).to.have.been.calledWithExactly(
            modelsMock.news, modelsMock.news.defaultPopulate, doneMock);
    });

    it('should remove single news', function () {
        var slugMock = sandbox.stub();

        modelsMock.news.findOneAndRemove = sandbox.stub();
        modelsMock.news.findOneAndRemove.returns(modelsMock.news);
        modelsMock.news.exec = sandbox.stub();

        controller.remove(slugMock, doneMock);

        expect(modelsMock.news.findOneAndRemove).to.have.been.calledWithExactly({slug: slugMock});
        expect(controllerHelpersMock.remove).to.have.been.calledWithExactly(modelsMock.news.exec, doneMock);
    });
});