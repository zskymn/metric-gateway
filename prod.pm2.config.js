module.exports = {
  apps: [{
    name: 'metric-gateway',
    script: './index.js',
    watch: false,
    instances: 8,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'prod',
      PORT: 6066
    }
  }]
};
