const _ = require('lodash');

const defaults = {
  jwtSecret: '7b466444-0816-11e9-a999-34363bc641f0',
  env: 'dev',
  log: {
    name: 'metric-gateway',
    level: 'info'
  },
  metricPrefix: 't',
  flushSize: 1000,
  maxFlushInterval: 1000,
  workers: {
    set: {
      mark: 'Set类型指标计算集群',
      instances: [
        ['http://127.0.0.1:7100', 1],
        ['http://127.0.0.1:7101', 2]
      ]
    },
    counter: {
      mark: 'Counter类型指标计算集群',
      instances: [
        ['http://127.0.0.1:7200', 1]
      ]
    },
    timing: {
      mark: 'Timing类型指标计算集群',
      instances: [
        ['http://127.0.0.1:7300', 1]
      ]
    },
    summary: {
      mark: 'Summary类型指标计算集群',
      instances: [
        ['http://127.0.0.1:7400', 1]
      ]
    }
  },
  adminTokens: [
    'ops_watcher:de38e208-0815-11e9-b288-34363bc641f0'
  ],
  healthcheckFile: './healthcheck.html'
};

const dev = {};

const prod = {
  env: 'prod',
  log: {
    streams: [{
      type: 'file',
      path: '/data/logs/metric-gateway/log'
    }]
  },
  metricPrefix: 's',
  workers: {
    set: {
      mark: 'Set类型指标计算集群',
      instances: [
        ['http://127.0.0.1:7100', 1],
        ['http://127.0.0.1:7101', 2]
      ]
    },
    counter: {
      mark: 'Counter类型指标计算集群',
      instances: [
        ['http://127.0.0.1:7200', 1]
      ]
    },
    timing: {
      mark: 'Timing类型指标计算集群',
      instances: [
        ['http://127.0.0.1:7300', 1]
      ]
    },
    summary: {
      mark: 'Summary类型指标计算集群',
      instances: [
        ['http://127.0.0.1:7400', 1]
      ]
    }
  }
};

const beta = {
  env: 'beta',
  log: {
    streams: [{
      type: 'file',
      path: '/data/logs/metric-gateway/log'
    }]
  },
  workers: {
    set: {
      mark: 'Set类型指标计算集群',
      instances: [
        ['http://127.0.0.1:7100', 1],
        ['http://127.0.0.1:7101', 2]
      ]
    },
    counter: {
      mark: 'Counter类型指标计算集群',
      instances: [
        ['http://127.0.0.1:7200', 1]
      ]
    },
    timing: {
      mark: 'Timing类型指标计算集群',
      instances: [
        ['http://127.0.0.1:7300', 1]
      ]
    },
    summary: {
      mark: 'Summary类型指标计算集群',
      instances: [
        ['http://127.0.0.1:7400', 1]
      ]
    }
  }
};

const test = {
  env: 'test'
};

function getConf(env) {
  let conf = {};
  if (env === 'prod') {
    conf = prod;
  } else if (env === 'test') {
    conf = test;
  } else if (env === 'beta') {
    conf = beta;
  } else {
    conf = dev;
  }
  return _.defaultsDeep({}, conf, defaults);
}

module.exports = getConf(process.env.NODE_ENV);
