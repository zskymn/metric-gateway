const events = require('events');

const _ = require('lodash');
const rp = require('request-promise');

const CONF = require('../common/conf');

function HttpSender(options) {
  var self = this;
  options = options || {};
  if (!(self instanceof HttpSender)) {
    return new HttpSender(options);
  }

  self.uri = options.uri + '/metric/push';
  self.metrics = [];
  self.flushSize = CONF.flushSize;
  self.maxFlushInterval = CONF.maxFlushInterval;
  self.lastFlushTs = Date.now();

  self.events = new events.EventEmitter();
  self.events.on('sendMetrics', self.sendMetrics.bind(self));

  self.flush();
}

HttpSender.prototype.send = function (metric) {
  let self = this;
  self.metrics.push(metric);
  self._flush();
};

HttpSender.prototype.flush = function () {
  let self = this;
  setTimeout(self.flush.bind(self), self.maxFlushInterval / 2);
  self._flush();
};

HttpSender.prototype._flush = function () {

  let self = this;
  let now = Date.now();
  if (self.metrics.length < self.flushSize && now - self.lastFlushTs < self.maxFlushInterval) {
    return;
  }

  self.lastFlushTs = now;
  if (self.metrics.length === 0) {
    return;
  }
  self.events.emit('sendMetrics', self.metrics);
  self.metrics = [];
};

HttpSender.prototype.sendMetrics = function (metrics) {
  let self = this;
  rp.post({
    uri: self.uri,
    json: true,
    body: {
      metrics: metrics
    }
  })
    .catch(_.noop);
};

function WorkerClient() {
  var self = this;
  if (!(self instanceof WorkerClient)) {
    return new WorkerClient();
  }
  self.httpSenders = {};
}

WorkerClient.prototype.send = function (instance, metric) {
  var self = this;
  if (!instance) {
    return;
  }

  if (!self.httpSenders[instance]) {
    self.httpSenders[instance] = HttpSender({
      uri: instance
    });
  }

  self.httpSenders[instance].send(metric);
};

module.exports = WorkerClient();
