const path = require("path");
// run server as lib project root directory
const cfgFilePath = path.join(process.cwd(), ".osqlrc.js");
const appConfig = require(cfgFilePath);
const defaultConfig = {
  ConnectionTimeSlowThres: 5, // higher than this, log slow connection
  ExecutionTimeSlowThres: 50, // higher than this, log slow execution
  DMLNoWhereCheckThres: 100, // higher than this, do update|delete no-where check
};
module.exports = { ...defaultConfig, ...appConfig };
