// 如果是管理服务
// "$admin/pool/task" 打印 pool task 的连接池占用状态

const poolMap = require('../buildAndKeepPools.js').registry;

async function poolToStats(poolName) {
  const pool = await oracledb.getPool(poolName);
  return {
    poolName,
    connectionsInUse: pool.connectionsInUse,
    connectionsOpen: pool.connectionsOpen,
    poolMax: pool.poolMax,
    free: pool.poolMax - pool.connectionsInUse,
  };
}
module.exports = async function $admin(ctx, next) {
  const sects = ctx.path.split('/');
  if (sects[1] === '$admin') {
    // for /$admin/pool/task
    if (sects[2] === 'pool') {
      if (sects[3]) { // "$admin/pool/task"
        ctx.body = await poolToStats(sects[3]);
      } else { // $admin/pool
        ctx.body = await Promise.all(Object.keys(poolMap).map(poolToStats));
      }
    }
    return;
  }
  await next();
};
