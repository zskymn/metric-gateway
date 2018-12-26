module.exports = {
  apps: [{
    name: 'metric-gateway',
    script: './index.js',
    watch: false,
    instances: 4,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'beta',
      PORT: 6066
    }
  }]
};
