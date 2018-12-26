const expect = require('chai').expect;
const rewire = require('rewire');
const _ = require('lodash');

const metric = rewire('../service/metric.js');

const formatMetric = metric.__get__('formatMetric');

describe('service.metric', function () {
  this.timeout(100);
  let authInfo = {
    appcode: 'ops_metricgw'
  };

  it('undefined body should raise error', function (done) {
    let body = undefined;
    metric.send(authInfo, body)
      .then(function () {
        done(new Error('Expected raise error'));
      }, function (err) {
        expect(err).to.not.equal(null);
        expect(err).to.not.equal(undefined);
        expect(err.name).to.equal('InputError');
        expect(err.message).to.equal('body must be dict');
        done();
      })
      .catch(done);
  });


  it('invalid metrics in body should raise error', function (done) {
    let body = {};
    metric.send(authInfo, body)
      .then(function () {
        done(new Error('Expected raise error'));
      }, function (err) {
        expect(err).to.not.equal(null);
        expect(err).to.not.equal(undefined);
        expect(err.name).to.equal('InputError');
        expect(err.message).to.equal('metrics in body must be list');
        done();
      })
      .catch(done);
  });

  it('valid metric count should be 1', function (done) {
    let body = {
      metrics: [{
        type: 'set',
        name: 'test_001',
        value: 12
      }]
    };
    metric.send(authInfo, body)
      .then(function (metricCount) {
        expect(metricCount).to.equal(1);
        done();
      })
      .catch(done);
  });

  it('[formatMetric] metric cannot be empty', function () {
    expect(formatMetric()).to.be.deep.equal(undefined);
  });

  it('[formatMetric] name cannot be empty', function () {
    expect(formatMetric({
      type: 'set'
    })).to.be.deep.equal(undefined);
  });

  it('[formatMetric] normal metric', function () {
    expect(formatMetric({
      type: 'set',
      name: 'test_001',
    }, 'ops_metricgw')).to.be.deep.equal({
      type: 'set',
      name: 't.ops_metricgw.test_001'
    });
  });

  it('[formatMetric] invalid character should replaced to _', function () {
    expect(formatMetric({
      type: 'set',
      name: 'test_001%%%'
    }, 'ops_metricgw')).to.be.deep.equal({
      type: 'set',
      name: 't.ops_metricgw.test_001___'
    });
  });

  it('[formatMetric] name too loog should be gave up', function () {
    expect(formatMetric({
      type: 'set',
      name: _.padEnd('name_is_too_loog', 300, '_')
    }, 'ops_metricgw')).to.be.deep.equal(undefined);
  });

  it('[formatMetric] name level cannot larger than 7', function () {
    expect(formatMetric({
      type: 'set',
      name: 'test.2.3.4.5.6.7.8'
    }, 'ops_metricgw')).to.equal(undefined);
  });

});
