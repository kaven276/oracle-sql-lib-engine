require('./cfg.js'); // must before require(server)
require('./buildAndKeepPools.js');

const oracledb = require('oracledb');
const Koa = require('koa');
const qs = require('qs');
global.sql = require('./sql.js');

const { default: logger } = require('./logger.js');
const converterMap = require('./convertsMap.js');
const { registry } = require('./servicesMap.js');
const adminService = require('./middleware/adminService.js');
const executeSqlModule = require('./executeSqlModule.js');

const statsMap = {};

const app = new Koa();
global.oracledb = oracledb;
global.converters = converterMap;

// 如果是 content-type:text/* 则强制认为是 application/json
// 避免浏览器直接发 application/json 造成 Preflighted requests
// 需要在 koa-body 自动解析前设置完毕
app.use(async (ctx, next) => {
  const contentType = ctx.headers['content-type'];
  if (contentType && contentType.match(/^text\//)) {
    ctx.headers['content-type'] = 'application/json';
  }
  await next();
});

// 获取请求体，解析成 js 数据，目前看必须是第一个中间件
app.use(require('koa-body')({
  formLimit: 10 * 1000 * 1000, // 上传大小 10M 以内都允许，默认是 56kb
}));

// 任何情形，允许跨域访问
app.use(async (ctx, next) => {
  await next();
  ctx.set('Access-Control-Allow-Origin', '*');
});

// 获取请求参数
app.use(async (ctx, next) => {
  const msg = ctx.request.body;
  ctx.state.req = { ...msg, ...qs.parse(ctx.querystring) };
  await next();
});

// 如果是管理服务
app.use(adminService);

// 获取对应的模块
app.use(async (ctx, next) => {
  const m = registry[ctx.path];
  let errMsg;
  if (!m) {
    errMsg = `no service for the path ${ctx.path}`;
  } else if (m.sqltext === null) {
    errMsg = `sql for the path ${ctx.path} have parsing error`;
  } else if (!m.sqltext) {
    errMsg = `no sql for the path ${ctx.path}`;
  }
  if (errMsg) { // 如果没有对应的有效SQL模块，直接返回异常
    ctx.response.body = JSON.stringify({
      respCode: -404,
      respDesc: errMsg,
    }, null, 2);
    return;
  }
  ctx.state.m = m;
  await next();
});

app.use(async (ctx, next) => {
  const m = ctx.state.m;
  const poolName = m.pool;

  if (!statsMap[m.path]) {
    statsMap[m.path] = {
      enterCount: 0,
      leaveCount: 0,
    };
  }
  const stats = statsMap[m.path];

  const concurrency = m.concurrency || Math.ceil(oracledb.getPool(poolName).poolMin / 3);
  // console.log(`${m.path}在途执行量${JSON.stringify(stats)}阀值${concurrency}`);
  if (stats.enterCount - stats.leaveCount > concurrency) {
    ctx.response.body = JSON.stringify({
      respCode: -1,
      respDesc: `${m.path}在途执行量${JSON.stringify(stats)}超过阀值${concurrency}，禁止执行`,
    }, null, 2);
    return;
  }
  stats.enterCount += 1;
  try {
    await next();
  } finally {
    // 无论核心执行成功失败，都算完成一次并发执行
    stats.leaveCount += 1;
  }
});

app.use(async (ctx, next) => {
  const m = ctx.state.m;
  const internal = {}; // 用于将执行内部过程的信息带出到外部
  try {
    const { sqlresult, meta } = await executeSqlModule(m, ctx.state.req, internal);
    ctx.response.body = JSON.stringify({
      respCode: 0,
      respDesc: `${m.title} - 成功`,
      data: sqlresult,
      meta,
    }, null, 2);
    logger.info({ type: 'success' }, { path: m.path, req: ctx.state.req });
  } catch (e) {
    logger.error({ type: 'error', err: e }, { path: m.path, req: ctx.state.req });
    ctx.response.body = JSON.stringify({
      respCode: e.errorNum,
      respDesc: `${m.title} - ${e.message}`,
      meta: {
        sqltext: internal.sqltext,
        bindObj: internal.bindObj,
      },
    }, null, 2);
  }
  await next();
});

module.exports = app;
