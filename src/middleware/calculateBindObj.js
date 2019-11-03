// pure Function
function extractValueByPath(obj, path) {
  const sects = path.split('__');
  let current = obj;
  for (const sect of sects) {
    current = current[sect];
  }
  return current;
}

// 根据 SQL 文本，静态配置的 bindObj，带入请求参数，形成最终执行用 bindObj
module.exports = function calculateBindObj(sqltext, req, bindObjCfg) {
  const bindObj = {};
  // console.log(1, sqltext.match(/:\w{3,}/gm));
  const match = sqltext.match(/(?::)\w{3,}/gm);
  if (match) {
    // 无匹配 match=null，有返回匹配数组
    match.forEach((param) => {
      const para = param.substr(1);
      const bindCfg = bindObjCfg && bindObjCfg[para];
      if (bindCfg) {
        switch (bindCfg.dir) {
          case oracledb.BIND_OUT:
            bindObj[para] = { ...bindCfg };
            break;
          case oracledb.BIND_IN:
          case oracledb.BIND_INOUT:
            bindObj[para] = { ...bindCfg, val: req[para] };
            break;
          default:
        }
      } else if (para.match(/Out/)) {
        const bindType = para.replace(/^(\w+)Out(\w*)$/, '$2') || 'DEFAULT';
        bindObj[para] = {
          dir: oracledb.BIND_OUT,
          type: oracledb[bindType.toUpperCase()],
        };
      } else if (para.endsWith('Cur')) {
        bindObj[para] = {
          dir: oracledb.BIND_OUT,
          type: oracledb.CURSOR,
        };
      } else {
        const value = extractValueByPath(req, para);
        bindObj[para] = {
          dir: oracledb.BIND_IN,
          val: String(value),
          // type: oracledb[(typeof value).toUpperCase()], // 支持 NUMBER, STRING
        };
      }
    });
  }
  return bindObj;
};
