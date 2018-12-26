const HashRing = require('hashring');
const _ = require('lodash');
const CONF = require('../common/conf');

function WorkerHash(options) {
  options = options || {};
  if (!(this instanceof WorkerHash)) {
    return new WorkerHash(options);
  }
  this.resetInterval = Math.min(Math.max(options.resetInterval || 1000 * 10, 1000), 1000 * 60);
  this.resetTimes = 0;
  this.reset();
}

WorkerHash.prototype.reset = function () {
  let self = this;
  let now = Date.now();
  let timeout = 100;

  setTimeout(self.reset.bind(self), timeout);

  if (self.resetTimes > 0 && now % self.resetInterval <= self.resetInterval - timeout) {
    return;
  }

  self.resetTimes += 1;
  let workersHash = {};

  _.each(CONF.workers, function (cinfo, c) {
    workersHash[c] = new HashRing(_.fromPairs(cinfo.instances), 'md5', {
      'max cache size': 100000
    });
  });

  self.workersHash = workersHash;
};

WorkerHash.prototype.get = function (metric) {
  let self = this;

  if (!metric.name || !_.isString(metric.name)) {
    return undefined;
  }

  if (!self.workersHash[metric.type]) {
    return undefined;
  }

  return self.workersHash[metric.type].get(metric.name) || undefined;
};

module.exports = WorkerHash();
