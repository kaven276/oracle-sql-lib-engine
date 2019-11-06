module.exports = {
  dirPools: __dirname + "/pools/", // 从哪里扫描连接池配置目录，默认是 __dirname + '/pools'
  defaultPoolName: "example", // 服务模块没有配置使用哪个连接池，则使用本参数指定的连接池
  dirServices: __dirname + "/services/",
  dirConverters: __dirname + "/converters/",
  // dirLog: '.',
  Timeout: 2 * 60 * 1000, // 默认2分钟超时, 提前中断，释放连接池
  LongExecThres: 10 * 1000, // 超过 10s 的执行认为是慢 sql，记录日志
  ConnectionTimeSlowThres: 50,
  ExecutionTimeSlowThres: 3000,
};
