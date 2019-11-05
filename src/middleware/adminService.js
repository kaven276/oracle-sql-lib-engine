// 如果是管理服务
// "$admin/pool/task" 打印 pool task 的连接池占用状态

module.exports = async function $admin(ctx, next) {
  const sects = ctx.path.split('/');
  if (sects[1] === '$admin') {
    // for /$admin/pool/task
    if (sects[2] === 'pool') {
      const pool = await oracledb.getPool(sects[3]);
      ctx.body = {
        connectionsInUse: pool.connectionsInUse,
        connectionsOpen: pool.connectionsOpen,
        poolMax: pool.poolMax,
        free: pool.poolMax - pool.connectionsInUse,
      };
    }
    return;
  }
  await next();
};
