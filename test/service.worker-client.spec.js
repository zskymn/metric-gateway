const expect = require('chai').expect;
const stub = require('sinon').stub;
const rewire = require('rewire');
const _ = require('lodash');

const CONF = require('../common/conf');

const workerClient = rewire('../service/worker-client.js');

describe('service.worker-client', function () {
  let instance_0 = 'http://127.0.0.1:37000';
  let instance_1 = 'http://127.0.0.1:37001';
  let instance_2 = 'http://127.0.0.1:37002';
  let instance_3 = 'http://127.0.0.1:37003';
  let metric = {
    type: 'set',
    name: 'test_001'
  };

  this.timeout(CONF.maxFlushInterval * 2);

  it('[send]参数instance为空时将直接返回', function () {
    workerClient.send(undefined, metric);
    expect(_.keys(workerClient.httpSenders)).to.deep.equal([]);

    workerClient.send('', metric);
    expect(_.keys(workerClient.httpSenders)).to.deep.equal([]);
  });

  it('[send]正常执行后将创建一个httpSender', function () {
    workerClient.send(instance_0, metric);
    expect(_.keys(workerClient.httpSenders)).to.deep.equal([instance_0]);
    workerClient.send(instance_1, metric);
    expect(_.keys(workerClient.httpSenders)).to.deep.equal([instance_0, instance_1]);
  });

  it('[send]flush机制应该正确', function (done) {
    workerClient.send(instance_2, metric);
    let httpSender = workerClient.httpSenders[instance_2];
    expect(httpSender.metrics.length).to.equal(1);
    _.each(_.range(20), function () {
      workerClient.send(instance_2, metric);
    });
    expect(httpSender.metrics.length).to.equal(21);
    _.each(_.range(CONF.flushSize), function () {
      workerClient.send(instance_2, metric);
    });
    expect(httpSender.metrics.length).to.equal(21);
    setTimeout(function () {
      expect(httpSender.metrics.length).to.equal(0);
      done();
    }, CONF.maxFlushInterval);
  });

  it('[send]metrics列表为空时也会触发lastFlushTs重置', function (done) {
    _.each(_.range(CONF.flushSize), function () {
      workerClient.send(instance_3, metric);
    });

    let httpSender = workerClient.httpSenders[instance_3];
    expect(httpSender.metrics.length).to.equal(0);

    let sendMetrics = stub(httpSender, 'sendMetrics');

    setTimeout(function () {
      expect(httpSender.metrics.length).to.equal(0);

      expect(Date.now() - httpSender.lastFlushTs < CONF.maxFlushInterval / 2).to.be.true;
      expect(sendMetrics.called).to.be.false;
      sendMetrics.restore();
      done();
    }, CONF.maxFlushInterval);
  });
});
