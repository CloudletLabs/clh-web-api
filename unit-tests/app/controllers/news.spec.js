var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

describe('The news controller module', function() {
    var sandbox = sinon.sandbox.create();

    var loggerMock,
        modelsMock,
        modelHelpers,
        doneMock,
        controller;

    beforeEach(function () {
        loggerMock = sandbox.stub();
        loggerMock.info = sandbox.stub();
        loggerMock.warn = sandbox.stub();
        loggerMock.error = sandbox.stub();

        modelsMock = sandbox.stub();
        modelsMock.user = sandbox.stub();
        modelsMock.userAuthToken = sandbox.stub();
        modelsMock.userRole = sandbox.stub();
        modelsMock.news = sandbox.stub();

        modelHelpers = sandbox.stub();
        modelHelpers.exec = sandbox.stub();

        doneMock = sandbox.stub();

        controller = require('../../../app/controllers/news')(loggerMock, modelsMock, modelHelpers);
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

    it('should return all news', function () {
        modelsMock.news.find = sandbox.stub();
        modelsMock.news.find.returns(modelsMock.news);

        modelsMock.news.sort = sandbox.stub();
        modelsMock.news.sort.returns(modelsMock.news);

        modelsMock.news.populate = sandbox.stub();
        modelsMock.news.populate.returns(modelsMock.news);

        var news1Mock = sandbox.stub();
        news1Mock.toObject = sandbox.stub();
        news1Mock.toObject.returns('news1Mock');
        var news2Mock = sandbox.stub();
        news2Mock.toObject = sandbox.stub();
        news2Mock.toObject.returns('news2Mock');
        var newsMock = [news1Mock, news2Mock];
        modelHelpers.exec.callsArgWith(1, newsMock);

        controller.getAll(doneMock);

        expect(modelsMock.news.find).to.have.been.calledWithExactly();
        expect(modelsMock.news.sort).to.have.been.calledWithExactly({createDate: 'desc'});
        expect(modelsMock.news.populate).to.have.been.calledWithExactly('creator', 'name');
        expect(modelHelpers.exec).to.have.been.calledWithExactly(modelsMock.news, sinon.match.func, doneMock);
        expect(news1Mock.toObject).to.have.been.calledWithExactly();
        expect(news2Mock.toObject).to.have.been.calledWithExactly();
        expect(doneMock).to.have.been.calledWithExactly(null, ['news1Mock', 'news2Mock']);
    });
});