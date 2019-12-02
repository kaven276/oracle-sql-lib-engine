```javascript
const cfgTemplate = {
  scan: {
    root: '', // 只要配置根目录，pools/services 都可以，默认环境变量 OSQL_ROOT
    pools: '',
    services: '',
    logs: '',
  },
  log: { // 控制日志和监控的条件和输出
    LongExecThres: 10 * 1000, // 超过 10s 的执行认为是慢 sql，记录日志
    ConnectionTimeSlowThres: 50,
    ExecutionTimeSlowThres: 3000,
  },
  protect: { // 每个目录，每个模块，可以单独配置，如 protect:Timeout: 3000，参考 molecular.js
    Timeout: 2 * 60 * 1000, // 默认2分钟超时, 提前中断，释放连接池
    Concurrency: 3, // default to 1/3 of pool capicity
    failedRate: 100, // 错误率到达 100%，直接熔断一段时间再恢复，参考 molecular 的策略
  },
  limits: {
    maxSize: 100,
    maxArraySize: 100,
  },
};
```
