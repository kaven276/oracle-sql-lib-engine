/**
 * 依赖全局的 oracledb 对象，使用里面的连接池执行 SQL
 */

const debugSqlExec = require('debug')('osql:exec');
const calculateBindObj = require('./middleware/calculateBindObj.js');
const processOutBinds = require('./middleware/processOutBinds.js');

async function executeSqlModule(m, reqOrigin, internal) {
  // 获取最终的请求，也即转换后的请求
  const req = (() => {
    if (m.inConverter && typeof m.inConverter === 'function') {
      // inConverter 可以直接修改 req 内容，而不返回新的 req 对象
      return m.inConverter(reqOrigin) || reqOrigin;
    }
    return reqOrigin;
  })();
  internal.req = req;

  // 获取最终要执行的 SQL 文本
  const sqltext = (() => {
    if (m.sqltext instanceof Function) {
      return m.sqltext(req);
    }
    return m.sqltext;
  })();
  internal.sqltext = sqltext;

  // 根据原始 sql 文本，里面的绑定参数，请求，和配置的绑定对象，计算中最终用于执行的绑定对象
  const bindObj = calculateBindObj(sqltext, req, m.bindObj);
  internal.bindObj = bindObj;

  debugSqlExec('path', m.path);
  debugSqlExec('request', req);
  debugSqlExec(sqltext);
  debugSqlExec('bindObj', bindObj);

  // 从连接池获取连接
  const beforeConnectionTime = Date.now();
  const connection = await oracledb.getConnection(m.pool);
  const connectionTime = Date.now() - beforeConnectionTime;
  connection.module = 'ora-sql-lib';
  connection.action = m.path;
  // connection.clientId 回头写 staffId 或者 callId

  const beforeExecutionTime = Date.now();
  let sqlresult = await connection.execute(sqltext, bindObj, m.options || {});
  await processOutBinds(sqlresult, bindObj);
  const executionTime = Date.now() - beforeExecutionTime;

  sqlresult = (() => {
    if (m.outConverter && typeof m.outConverter === 'function') {
      // outConverter 可以直接修改 sqlresult 内容，而不返回新的 sqlresult 对象
      return m.outConverter(sqlresult, req) || sqlresult;
    }
    return sqlresult;
  })();

  if (sqlresult.rowsAffected || !sqlresult.rows) {
    await connection.commit();
  }
  await connection.close();
  return {
    sqlresult,
    meta: {
      connectionTime,
      executionTime,
    },
  };
}

module.exports = executeSqlModule;
