const path = require("path");

const cfgFilePath = path.join(path.dirname(require.main.filename), ".osqlrc.js");
const appConfig = require(cfgFilePath);
const defaultConfig = {
  ConnectionTimeSlowThres: 5, // higher than this, log slow connection
  ExecutionTimeSlowThres: 50, // higher than this, log slow execution
  DMLNoWhereCheckThres: 100, // higher than this, do update|delete no-where check
};
module.exports = { ...defaultConfig, ...appConfig };
