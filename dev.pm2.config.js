module.exports = {
  apps: [{
    name: 'metric-gateway',
    script: './index.js',
    watch: true,
    env: {
      NODE_ENV: 'dev',
      PORT: 6066
    }
  }]
};
