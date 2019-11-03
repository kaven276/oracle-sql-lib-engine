const readLobAsync = require('../readLobAsync.js');

module.exports = async function processOutBinds(sqlresult, bindObj) {
  // 查看有 outBinds.xxx.metaData 情况
  const outBinds = sqlresult.outBinds;
  for (let i = 0, keys = Object.keys(bindObj), len = keys.length; i < len; i += 1) {
    const n = keys[i];
    const bindConfig = bindObj[n];
    if (bindConfig.type === oracledb.CURSOR) {
      try {
        outBinds[n].rows = await outBinds[n].getRows(100);
        await outBinds[n].close();
      } catch (e) {
        // refCursor 没有 open
      }
    } else if (bindConfig.type === oracledb.CLOB) {
      outBinds[n] = await readLobAsync(outBinds[n]);
    }
    const outName = n.match(/^(.*)(Out|Cur)($|Number|Date|String|Clob|Blob|Buffer)/);
    if (outName) {
      const key = outName[1];
      const suffix = outName[2];
      if (suffix) {
        outBinds[key] = outBinds[n];
        delete outBinds[n];
      }
    }
  }
};
