// 当原始文本一行当中
// ${false} ${undefined} 时，本行忽略
// ${true} 时，本行使用，但是 ${} 本身忽略
// ${string} ${number} 时，拼入字符串
// ${array} 时，拼入 v1,v2 或者 'v1','v2'
function sql(strArr, ...values) {
  const f = [];
  let discardLine = false;
  function trimBeforeNl(str) {
    discardLine = false;
    const nextNlPos = str.indexOf("\n");
    if (nextNlPos >= 0) {
      return str.substr(nextNlPos);
    }
    return str;
  }
  function trimAfterNl(str) {
    discardLine = true;
    const lastNlPos = str.lastIndexOf("\n");
    if (lastNlPos >= 0) {
      return str.substr(0, lastNlPos);
    }
    return str;
  }

  values.forEach((v, i) => {
    const strCur = discardLine ? trimBeforeNl(strArr[i]) : strArr[i];
    if (v === true) {
      f.push(strCur);
    } else if (v === false || v === undefined) {
      f.push(trimAfterNl(strCur));
    } else if (typeof v === "string") {
      if (v) f.push(strCur, v);
    } else if (typeof v === "number") {
      if (v) f.push(strCur, v);
    } else if (v instanceof Array) {
      const sep = strCur.substr(-1);
      if (sep === "'") {
        f.push(strCur, v.join("', '"));
      } else {
        f.push(v.join(","));
      }
    }
  });
  const strLast = strArr[strArr.length - 1];
  f.push(discardLine ? trimBeforeNl(strLast) : strLast);
  return f.join("");
}

module.exports = sql;
