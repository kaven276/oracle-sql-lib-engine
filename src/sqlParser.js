function stripSqlComment(sqltext, lines) {
  const notCommentedLines = lines.reduce((prev, curr) => {
    if (!curr.match(/^\s*--/)) prev.push(curr.split("--")[0]);
    return prev;
  }, []);
  return notCommentedLines.join("\n");
}

// --${} 将 -- 去掉
function makeSqlGenFunc(sqltext, lines, path) {
  const notCommentedLines = lines.reduce((prev, curr) => {
    if (curr.match(/^\s*--/)) return prev;
    prev.push(curr.replace("--${", "${")); // 把行尾 ifLine 条件标注，去掉--，还原成 sql`text` 认知的格式
    return prev;
  }, []);
  const dynamicSqlText = notCommentedLines.join("\n");

  const sqlFuncParamNames = [];
  // match :name
  const match = sqltext.match(/(?::)\w{3,}/gm);
  if (match) {
    // 无匹配 match=null，有返回匹配数组
    match.forEach(param => {
      const name = param.substr(1);
      if (sqlFuncParamNames.indexOf(name) >= 0) return;
      sqlFuncParamNames.push(name);
    });
  }
  // match ${!!name}
  const match$ = sqltext.match(/\${!?!?(\w+)}/gm);
  if (match$) {
    match$.forEach(param => {
      const name = param.match(/\w+/)[0];
      if (sqlFuncParamNames.indexOf(name) >= 0) return;
      sqlFuncParamNames.push(name);
    });
  }
  // 提取全部的绑定变量 :name
  // 崎岖全部的 ${} 变量
  let sqlGenFunc;
  try {
    // eslint-disable-next-line no-eval
    sqlGenFunc = eval(`({${sqlFuncParamNames.join(",")}})=>sql\`${dynamicSqlText}\``);
  } catch (e) {
    console.error('parse dynamic sql failed', path);
    console.error(e);
    console.error(dynamicSqlText);
    return null;
  }
  return sqlGenFunc;
}
exports.makeSqlGenFunc = makeSqlGenFunc;
exports.stripSqlComment = stripSqlComment;
