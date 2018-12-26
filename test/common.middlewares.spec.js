const expect = require('chai').expect;
const createSandbox = require('sinon').createSandbox;

const mws = require('../common/middlewares.js');
const errors = require('../common/errors.js');
const LOG = require('../common/logger.js');

describe('common.middlewares', function () {
  let sandbox;
  beforeEach(function () {
    sandbox = createSandbox();
  });
  afterEach(function () {
    sandbox.restore();
  });

  it('[respAsJsonOrJsonp]返回值为json', function (done) {
    let next = async function () {
      return 1;
    };
    let ctx = {
      query: {}
    };
    mws.respAsJsonOrJsonp(ctx, next)
      .then(function () {
        expect(ctx.type).to.equal('json');
        expect(JSON.parse(ctx.body)).to.deep.equal({
          errcode: 0,
          message: '',
          data: 1
        });
        done();
      })
      .catch(done);;
  });

  it('[respAsJsonOrJsonp]返回值为js', function (done) {
    let next = async function () {
      return 1;
    };
    let ctx = {
      query: {
        callback: 'callback'
      }
    };

    mws.respAsJsonOrJsonp(ctx, next)
      .then(function () {
        expect(ctx.type).to.equal('js');
        done();
      })
      .catch(done);;
  });

  it('[respAsJsonOrJsonp]InputError返回', function (done) {
    let next = sandbox.stub();
    next.rejects(new errors.InputError('test input error'));

    let ctx = {
      query: {}
    };

    let logWarn = sandbox.stub(LOG, 'warn');

    mws.respAsJsonOrJsonp(ctx, next)
      .then(function () {
        expect(ctx.type).to.equal('json');
        expect(JSON.parse(ctx.body).message).to.equal('test input error');
        expect(JSON.parse(ctx.body).errcode).to.equal(400);
        expect(logWarn.called).to.be.true;
        done();
      })
      .catch(done);;
  });

  it('[respAsJsonOrJsonp]SystemError返回', function (done) {
    let next = sandbox.stub();
    next.rejects(new errors.SystemError('test system error'));

    let ctx = {
      query: {}
    };

    let logError = sandbox.stub(LOG, 'error');

    mws.respAsJsonOrJsonp(ctx, next)
      .then(function () {
        expect(ctx.type).to.equal('json');
        expect(JSON.parse(ctx.body).message).to.equal('test system error');
        expect(JSON.parse(ctx.body).errcode).to.equal(500);
        expect(logError.called).to.be.true;
        done();
      })
      .catch(done);;
  });

  it('[authentication]headers中无x-app-token异常', function (done) {
    let ctx = {
      request: {
        headers: {}
      }
    };

    let next = sandbox.stub();
    next.resolves();

    mws.authentication(ctx, next)
      .then(function () {
        done(new Error('Expected raise error'));
      })
      .catch(function (err) {
        expect(err.status).to.equal(400);
        expect(err.message).to.equal('X-App-Token must exist in headers');
        done();
      });
  });

  it('[authentication]x-app-token不合法', function (done) {
    let ctx = {
      request: {
        headers: {
          'x-app-token': 'invalid token'
        }
      }
    };

    let next = sandbox.stub();
    next.resolves();

    mws.authentication(ctx, next)
      .then(function () {
        done(new Error('Expected raise error'));
      })
      .catch(function (err) {
        expect(err.status).to.equal(400);
        expect(err.message).to.equal('X-App-Token invaild');
        done();
      })
      .catch(done);
  });

});
