
require('./lib.js').testAll(async t => {
  // await t('/selectDual');

  // await t('/query/queryMainBasic');
  // await t('/query/queryMainParam');
  // await t('/query/queryMainParam', { custName: 'Li' });
  // await t('/query/selectMainInto', { custName: 'LiYuze' });

  // await t("/dml/insertMain?custName=LiYong");
  // await t("/dml/insertMain?custName=LiXinyan");
  // await t("/dml/insertMainReturn?custName=LiYuze");
  // await t("/dml/updateMainStatus?tradeId=3&status=9");
  // await t("/dml/deleteMain?custName=LiXinyan");
  // await t("/dml/insertMain?custName=LiXinyan");
  // await t("/dml/updateMainReturn?tradeId=4&status=9");
  // await t("/dml/deleteMainReturn?tradeId=28");
  // await t("/dml/updateMultiReturn?status=7");

  // await t("/storedpl/createProcedure");
  // await t("/storedpl/execProcedure?sts=1");

  // await t("/typebind/bindNull");
  // await t("/typebind/bindNull", { none: ''});
  // await t("/typebind/bindNull", { none: 1});
  // await t("/typebind/bindNull", { none: 'y'});

  // await t("/plsql/basicBind", {xing: 'Li'})
  // await t("/plsql/cursorBind", { type: 'table', pattern: 'OSQL%' });
  // await t("/plsql/cursorBind", { type: 'index', pattern: 'OSQL%' });
  // await t("/plsql/cursorBind");
  // await t("/plsql/dmlRollback", { tradeId: 41 });
  // await t("/plsql/dmlRollback", { tradeId: 42 });
});
