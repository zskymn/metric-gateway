const expect = require('chai').expect;
const request = require('supertest');
const fs = require("fs");
const createSandbox = require('sinon').createSandbox;

const index = require('../index.js');
const metric = require('../service/metric.js');
const mws = require('../common/middlewares');

describe('api', function () {
  let sandbox;
  beforeEach(function () {
    sandbox = createSandbox();
  });
  afterEach(function () {
    sandbox.restore();
  });

  let server = index.run().listen();

  it('[/]should return 200', function () {
    return request(server)
      .get('/')
      .expect('Content-Type', /text/)
      .expect(200, 'welcome to metric gateway');
  });

  it('[/healthcheck.html]healthcheck.html文件存在', function (done) {
    let existsSync = sandbox.stub(fs, 'existsSync');
    existsSync.returns(true);
    request(server)
      .get('/healthcheck.html')
      .expect('Content-Type', /text/)
      .expect(200, 'ok')
      .then(function () {
        expect(existsSync.called).to.be.true;
        done();
      })
      .catch(done);
  });

  it('[/healthcheck.html]healthcheck.html文件不存在', function (done) {
    let existsSync = sandbox.stub(fs, 'existsSync');
    existsSync.returns(false);
    request(server)
      .get('/healthcheck.html')
      .expect('Content-Type', /text/)
      .expect(404, 'Not Found')
      .then(function () {
        expect(existsSync.called).to.be.true;
        done();
      })
      .catch(done);
  });

  it('[/v1/metric/send]metric send的返回值正常', function (done) {
    let send = sandbox.stub(metric, 'send');
    send.resolves(20);

    let authentication = sandbox.stub(mws, 'authentication');

    authentication.callsFake(async function (ctx, next) {
      return next();
    });

    let newServer = index.run().listen();

    request(newServer)
      .post('/v1/metric/send')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      .then(function () {
        expect(authentication.called).to.be.true;
        expect(send.called).to.be.true;
        done();
      })
      .catch(done);
  });

});
