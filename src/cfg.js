const path = require("path");
// run server as lib project root directory
const cwd = process.cwd();
const cfgFilePath = path.join(cwd, ".osqlrc.js");
let appConfig;
try {
  appConfig = require(cfgFilePath);
} catch (e) {
  appConfig = {
    dirPools: `${cwd}/pools/`, // 从哪里扫描连接池配置目录，默认是 __dirname + '/pools'
    dirServices: `${cwd}/services/`,
    dirConverters: `${cwd}/converters/`,
  };
}

const defaultConfig = {
  defaultPoolName: 'default', // default pool name to "default"
  ConnectionTimeSlowThres: 5, // higher than this, log slow connection
  ExecutionTimeSlowThres: 50, // higher than this, log slow execution
  DMLNoWhereCheckThres: 100, // higher than this, do update|delete no-where check
};
module.exports = { ...defaultConfig, ...appConfig };
