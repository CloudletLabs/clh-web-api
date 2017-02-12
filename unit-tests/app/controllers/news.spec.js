'use strict';

let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require("sinon-chai");
let expect = chai.expect;
chai.use(sinonChai);

describe('The news controller module', function() {
    let sandbox = sinon.sandbox.create();

    let loggerMock,
        modelsMock,
        controllerHelpersMock,
        doneMock,
        controller;

    beforeEach(function () {
        loggerMock = sandbox.stub();

        modelsMock = sandbox.stub();
        modelsMock.news = sandbox.stub();
        modelsMock.news.generateNew = sandbox.stub();
        modelsMock.news.defaultPopulate = sandbox.stub();
        modelsMock.news.find = sandbox.stub().returns(modelsMock.news);
        modelsMock.news.findOne = sandbox.stub().returns(modelsMock.news);
        modelsMock.news.sort = sandbox.stub().returns(modelsMock.news);
        modelsMock.news.count = sandbox.stub().returns(modelsMock.news);
        modelsMock.news.findOneAndRemove = sandbox.stub().returns(modelsMock.news);
        modelsMock.news.exec = sandbox.stub();

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
        controller.getAll(doneMock);

        expect(modelsMock.news.find).to.have.been.calledWithExactly();
        expect(modelsMock.news.sort).to.have.been.calledWithExactly({createDate: 'desc'});
        expect(controllerHelpersMock.get).to.have.been.calledWithExactly(
            modelsMock.news, modelsMock.news.defaultPopulate, doneMock);
    });

    it('should create news', function () {
        let creatorMock = sandbox.stub();
        let newsJsonMock = {
            slug: 'test slug',
            subject: 'test subject',
            text: 'test text'
        };
        let savedNews = sandbox.stub();
        modelsMock.news.generateNew.returns(savedNews);

        controller.create(creatorMock, newsJsonMock, doneMock);

        expect(modelsMock.news.generateNew).to.have.been.calledWithExactly(
            'test slug', creatorMock, 'test subject', 'test text');
        expect(modelsMock.news.count).to.have.been.calledWithExactly({slug: 'test slug'});
        expect(controllerHelpersMock.create).to.have.been.calledWithExactly(
            modelsMock.news, savedNews, modelsMock.news.defaultPopulate, doneMock);
    });

    it('should get single news', function () {
        let slugMock = sandbox.stub();

        controller.get(slugMock, doneMock);

        expect(modelsMock.news.findOne).to.have.been.calledWithExactly({slug: slugMock});
        expect(controllerHelpersMock.get).to.have.been.calledWithExactly(
            modelsMock.news, modelsMock.news.defaultPopulate, doneMock);
    });

    it('should update news with slug change', function () {
        let slugMock = sandbox.stub();
        let updatedNewsMock = sandbox.stub();
        updatedNewsMock.slug = sandbox.stub();

        controller.update(slugMock, updatedNewsMock, doneMock);

        expect(modelsMock.news.findOne).to.have.been.calledWithExactly({slug: slugMock});
        expect(modelsMock.news.count).to.have.been.calledWithExactly({slug: updatedNewsMock.slug});
        expect(controllerHelpersMock.update).to.have.been.calledWithExactly(
            modelsMock.news, modelsMock.news, updatedNewsMock, modelsMock.news.defaultPopulate, doneMock);
    });

    it('should update news without slug change', function () {
        let slugMock = sandbox.stub();
        let updatedNewsMock = sandbox.stub();

        controller.update(slugMock, updatedNewsMock, doneMock);

        expect(modelsMock.news.findOne).to.have.been.calledWithExactly({slug: slugMock});
        expect(controllerHelpersMock.update).to.have.been.calledWithExactly(
            modelsMock.news, null, updatedNewsMock, modelsMock.news.defaultPopulate, doneMock);
    });

    it('should remove single news', function () {
        let slugMock = sandbox.stub();
        let promiseMock = sandbox.stub();

        modelsMock.news.exec.returns(promiseMock);

        controller.remove(slugMock, doneMock);

        expect(modelsMock.news.findOneAndRemove).to.have.been.calledWithExactly({slug: slugMock});
        expect(controllerHelpersMock.remove).to.have.been.calledWithExactly(promiseMock, doneMock);
    });
});