exports.poolAttrs = {
  poolAlias: "example", // could set an alias to allow access to the pool via a name.
  // edition: 'ORA$BASE', // used for Edition Based Redefintion
  // events: false, // whether to handle Oracle Database FAN and RLB events or support CQN
  // externalAuth: false, // whether connections should be established using External Authentication
  // homogeneous: true, // all connections in the pool have the same credentials
  poolMax: 2, // maximum size of the pool. Increase UV_THREADPOOL_SIZE if you increase poolMax
  poolMin: 2, // start with no connections; let the pool shrink completely
  poolIncrement: 0, // only grow the pool by one connection at a time
  poolTimeout: 10, // terminate connections that are idle in the pool for 60 seconds
  poolPingInterval: 30, // check aliveness of connection if in the pool for 60 seconds
  queueRequests: true, // let Node.js queue new getConnection() requests if all pool connections are in use
  queueTimeout: 10000, // terminate getConnection() calls in the queue longer than 60000 milliseconds
  stmtCacheSize: 20, // number of statements that are cached in the statement cache of each connection
  _enableStats: true, // default is false
  // 用户名密码连接串可以来自环境变量 POOL_EXAMPLE_URL='user:password@ip:port/service'
  // user: "example", // '可以来自环境变量 POOL_EXAMPLE_USER',
  // password: "example", // '可以来自环境变量 POOL_EXAMPLE_PASSWORD',
  // connectString: "127.0.0.1:1521/example", // 可以来自环境变量 POOL_EXAMPLE_CONNECT',
};

