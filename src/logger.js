const cfg = require('./cfg.js');
const bunyan = require('bunyan');
const path = require('path');

const dirLog = cfg.dirLog || `${__dirname.split('/').slice(0, 3).join('/')}/.pm2/logs`;
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
