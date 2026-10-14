const path = require('node:path');

module.exports = {
  apps: [{
    // Keep the PM2 name aligned with the process already used by the Nginx host.
    name: process.env.DEPLOY_PM2_APP_NAME || 'csnis-webpage',
    cwd: __dirname,
    script: 'server.js',
    node_args: '--env-file=' + path.join(__dirname, '.env'),
    env: { NODE_ENV: 'production', PORT: '3000' },
    time: true
  }]
};
