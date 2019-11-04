const cfg = require('./cfg.js');
const oracledb = require('oracledb');
const chokidar = require('chokidar');
const { join } = require('path');
const debug = require('debug')('osql:pools');

const registry = {}; // pool registry
const poolConfirDir = cfg.dirPools || join(__dirname, '../pools/');
const UV_THREADPOOL_SIZE = +process.env.UV_THREADPOOL_SIZE || 20;
let poolThreadCount = 0;

/*
ORA-24413: Invalid number of sessions specified
Cause: An invalid combination of minimum, maximum and
increment number of sessions was specified in the OCISessionPoolCreate call.

https://oracle.github.io/node-oracledb/doc/api.html#numberofthreads
$ UV_THREADPOOL_SIZE=10 node myapp.js
*/

/* log stats example
Pool statistics:
...total up time (milliseconds): 7145
...total connection requests: 1
...total requests enqueued: 0
...total requests dequeued: 0
...total requests failed: 0
...total request timeouts: 0
...max queue length: 0
...sum of time in queue (milliseconds): 0
...min time in queue (milliseconds): 0
...max time in queue (milliseconds): 0
...avg time in queue (milliseconds): 0
...pool connections in use: 1
...pool connections open: 10
Related pool attributes:
...poolAlias: bill
...queueRequests: true
...queueTimeout (milliseconds): 3000
...poolMin: 10
...poolMax: 10
...poolIncrement: 0
...poolTimeout (seconds): 600
...poolPingInterval: 59
...stmtCacheSize: 2
Related environment variables:
...process.env.UV_THREADPOOL_SIZE: 15
*/

oracledb.fetchAsString = [
  oracledb.DATE,
  // oracledb.NUMBER,
  oracledb.CLOB,
  oracledb.BUFFER,
];
oracledb.outFormat = oracledb.OBJECT;
oracledb.maxRows = 100000; // In version 1, the default value was 100. too low
oracledb.autoCommit = false;
oracledb.extendedMetaData = false;
oracledb.poolMin = 4;
oracledb.poolMax = 4;
oracledb.poolPingInterval = 60;
oracledb.poolTimeout = 60;
oracledb.queueTimeout = 60 * 1000;


const defaultPoolAttrs = {
  // edition: 'ORA$BASE', // used for Edition Based Redefintion
  // events: false, // whether to handle Oracle Database FAN and RLB events or support CQN
  // externalAuth: false, // whether connections should be established using External Authentication
  // homogeneous: true, // all connections in the pool have the same credentials
  poolMax: 4, // maximum size of the pool. Increase UV_THREADPOOL_SIZE if you increase poolMax
  poolMin: 4, // start with no connections; let the pool shrink completely
  poolIncrement: 0, // only grow the pool by one connection at a time
  poolTimeout: 10, // terminate connections that are idle in the pool for 60 seconds
  poolPingInterval: 30, // check aliveness of connection if in the pool for 60 seconds
  queueRequests: true, // let Node.js queue new getConnection() requests if all pool connections are in use
  queueTimeout: 10000, // terminate getConnection() calls in the queue longer than 60000 milliseconds
  stmtCacheSize: 2, // number of statements that are cached in the statement cache of each connection
  _enableStats: true, // default is false
};

function checkPoolConfigAndCreatePool(poolConfig, poolName) {
  const { poolAttrs } = poolConfig;
  const PoolName = poolName.toUpperCase();

  // 检查必要属性是否齐全
  if (poolAttrs.poolAlias && poolAttrs.poolAlias !== poolName) {
    throw new Error(`poolAlias ${poolAttrs.poolAlias} 配置的话，必须和 pool 配置文件名 ${poolName} 一致 `);
  }

  const POOL_URL = process.env[`POOL_${PoolName}_URL`] || ':@';
  const urlMatch = POOL_URL.match(/^(\w*):(\w*)@(.*)$/); // user:password@ip:port/service
  const user = urlMatch[1];
  const password = urlMatch[2];
  const connect = urlMatch[3];

  if (!poolAttrs.user) {
    poolAttrs.user = process.env[`POOL_${PoolName}_USER`] || user;
  }
  if (!poolAttrs.password) {
    poolAttrs.password = process.env[`POOL_${PoolName}_PASSWORD`] || password;
  }
  if (!poolAttrs.connectString) {
    poolAttrs.connectString = process.env[`POOL_${PoolName}_CONNECT`] || connect;
  }

  if (!poolAttrs.user) {
    throw new Error(`${poolName} 没有 user 数据库用户名`);
  }
  if (!poolAttrs.password) {
    throw new Error(`${poolName} 没有 password 数据库密码`);
  }
  if (!poolAttrs.connectString) {
    throw new Error(`${poolName} 没有 connectString 连接串配置`);
  }

  const finalPoolAttrs = {
    ...defaultPoolAttrs,
    ...poolAttrs,
    poolAlias: poolName, // could set an alias to allow access to the pool via a name.
  };

  poolThreadCount += finalPoolAttrs.poolMin;
  if (poolThreadCount > UV_THREADPOOL_SIZE) {
    console.error(`所有pool poolMin 总和${poolThreadCount}
    即将超过 UV_THREADPOOL_SIZE(${UV_THREADPOOL_SIZE}),
    不允许创建 pool(${poolName})`);
  } else {
    oracledb.createPool(finalPoolAttrs)
      .then(() => {
        registry[poolName] = poolConfig;
        debug('pool created', poolName);
      })
      .catch((e) => {
        console.error('pool created failed', poolName, e);
      });
  }
}

chokidar
  .watch(poolConfirDir, {
    cwd: poolConfirDir,
    disableGlobbing: false,
    depth: 1,
    awaitWriteFinish: true,
  })
  .on('all', (event, path) => {
    // console.log(event, path);
    if (!path.match(/pool\.\w+\.js$/)) return;
    const requirePath = poolConfirDir + path;
    const poolName = path.replace(/^pool\.(\w+)\.js$/, '$1');
    let poolConfig;
    let absPath;
    switch (event) {
      case 'add': // 发现新配置文件则创建相应名字的pool
        poolConfig = require(requirePath);
        checkPoolConfigAndCreatePool(poolConfig, poolName);
        break;
      case 'change-': // 配置变化暂不做删除pool再重建操作
        absPath = require.resolve(requirePath);
        if (absPath) {
          delete require.cache[absPath];
        } else {
          console.log('no absPath');
        }
        poolConfig = require(requirePath);
        checkPoolConfigAndCreatePool(poolConfig, poolName);
        break;
      case 'unlink': // 删除配置文件则关闭对应的 pool
        absPath = require.resolve(requirePath);
        if (absPath) {
          delete require.cache[absPath];
        } else {
          console.log('no absPath');
        }
        delete registry[poolName];
        oracledb.getPool(poolName).close(30);
        break;
      default:
    }
  });

// setTimeout(() => console.log(Object.keys(registry)), 3000);

function closeDB() {
  Object.keys(registry).forEach((poolName) => {
    console.log(`closing pool ${poolName}...`);
    oracledb.getPool(poolName).close();
  });
}
process
  .on('SIGTERM', () => {
    console.log('\nTerminating');
    closeDB();
    process.exit(0);
  })
  .on('SIGINT', () => {
    console.log('\nTerminating');
    closeDB();
    process.exit(0);
  });

exports.registry = registry;
