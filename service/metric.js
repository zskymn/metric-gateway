const _ = require('lodash');
const InputError = require('../common/errors').InputError;

const workerHash = require('./worker-hash');
const workerClient = require('./worker-client');
const CONF = require('../common/conf');

const NAME_RE = /[^A-Za-z0-9\-\._]/g;
const REPLACE_CODE = '_';
const NAME_MAX_LEN = 50;
const MAX_LEVELS = 9;

exports.send = send;

function formatMetric(metric, appcode) {
  if (!_.isObject(metric)) {
    return undefined;
  }

  if (!metric.name || !_.isString(metric.name)) {
    return undefined;
  }

  if (!appcode || !_.isString(appcode)) {
    return undefined;
  }

  let name = `${CONF.metricPrefix}.${appcode}.${metric.name}`;

  name = name.replace(NAME_RE, REPLACE_CODE);

  let names = name.split('.');

  if (names.length > MAX_LEVELS) {
    return undefined;
  }

  if (_.some(names, function (_name) {
    return _name.length > NAME_MAX_LEN;
  })) {
    return undefined;
  }

  metric.name = name;
  return metric;
}

async function send(authInfo, body) {
  if (!_.isObject(body)) {
    throw new InputError('body must be dict');
  }

  let totalMetrics = 0;

  let metrics = body.metrics;

  if (!_.isArray(metrics)) {
    throw new InputError('metrics in body must be list');
  }

  _.each(metrics, function (metric) {
    metric = formatMetric(metric, authInfo.appcode);
    if (metric) {
      let instance = workerHash.get(metric);
      if (instance) {
        totalMetrics += 1;
        workerClient.send(instance, metric);
      }
    }
  });

  return {
    validMetricsCount: totalMetrics
  };
}
