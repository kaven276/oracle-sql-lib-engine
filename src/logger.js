const cfg = require('./cfg.js');
const bunyan = require('bunyan');
const path = require('path');

const logger = bunyan.createLogger({
  name: 'osql',
  streams: [{
    type: 'rotating-file',
    path: path.join(cfg.dirLog, 'osql.log'),
    period: '1d', // daily rotation
    count: 31, // keep 3 back copies
  }],
});

exports.default = logger;
exports.logSlow = logger.child({ type: 'slow' });
exports.logError = logger.child({ type: 'error' });
exports.logConnFail = logger.child({ type: 'connFail' });
