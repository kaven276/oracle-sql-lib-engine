const cfg = require('./cfg.js');
const bunyan = require('bunyan');
const path = require('path');
const fs = require('fs');

const dirLog = (() => {
  if (cfg.dirLog) return cfg.dirLog;
  const pm2logDir = `${__dirname.split('/').slice(0, 3).join('/')}/.pm2-/logs`;
  if (fs.existsSync(pm2logDir)) {
    return pm2logDir;
  }
  return '.'; // fallback to server entrance dir
})();


const logger = bunyan.createLogger({
  name: 'osql',
  streams: [{
    type: 'rotating-file',
    path: path.join(dirLog, 'osql.log'),
    period: '1d', // daily rotation
    count: 31, // keep 3 back copies
  }],
});

exports.default = logger;
exports.logSlow = logger.child({ type: 'slow' });
exports.logError = logger.child({ type: 'error' });
exports.logConnFail = logger.child({ type: 'connFail' });
