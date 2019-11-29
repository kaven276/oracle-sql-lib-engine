// 对于有问题的模块，直接报错。
// 包括静态分析出带风险的模块，动态执行收集信息发现有风险的
module.exports = async (ctx, next) => {
  const { m } = ctx.state;
  // eslint-disable-next-line no-proto
  // console.log('m.fromDirConfig', m.path, m.__proto__, m.__proto__.__proto__, m.__proto__.__proto__.__proto__);
  // eslint-disable-next-line guard-for-in
  if (m.staticError) {
    ctx.response.body = JSON.stringify({
      respCode: -1,
      respDesc: m.staticError,
    }, null, 2);
  } else {
    await next();
  }
};
