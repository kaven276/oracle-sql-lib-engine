const path = require("path");

const cfgFilePath = path.join(path.dirname(require.main.filename), ".osqlrc.js");
const appConfig = require(cfgFilePath);
const defaultConfig = {
  ConnectionTimeSlowThres: 5, // higher than this, log slow connection
  ExecutionTimeSlowThres: 50, // higher than this, log slow execution
};
module.exports = { ...defaultConfig, ...appConfig };
