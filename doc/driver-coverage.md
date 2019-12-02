驱动接口参数的覆盖度分析
======================

## connection.execute

```javascript
connection.execute(sql,
  bindVar: {
    dir: '', // osql 只有 in/out 两种，不支持 inout，nameOut 的为out参数，完备
    maxArraySize: 100, // todo 系统默认 100，但是应用模块可以指定，确保 out 数组能接受全即可
    maxSize: '', // in参数不看，out参数默认200，需要能支持配置，如果统一lob单独取，则一般200字节够用
    type: '', // in参数自动判断，out参数可以指定 nameOutNumber，nameCur 代表out返回游标
    val: '', // 来自请求，默认为 m.xxx 配置； todo: 或者改成 m.default.xxx 配置
  }, {
    autoCommit: false, // fixed. default to oracledb.autoCommit, that osql set to false
    extendedMetaData: false, // fixed，或者默认打开
    fetchArraySize: 100, // fixed. The default value is 100. internal buffer 只影响性能不非要应用调整
    fetchInfo: {
      name: {
        type: oracledb.DEFAULT, // 不需要了，因为不是使用 default，就是使用全局配置 fetchAsString or fetchAsBuffer
      }
    },
    maxRows: 100000, // 默认 10 万，足够使用
    outFormat: oracledb.OUT_FORMAT_OBJECT, // 默认写死
    resultSet: false, // 写死
  }
 })

 sqlResult = {
   metaData: [],
   outBinds: {}, // outBind items
   resultSet: undefined, // fixed
   rows: [],
   rowsAffected: 1,
 }
```

## connection.executeMany

```javascript
connection.executeMany(sql, {
  bindVar: {
    dir: '', // osql 只有 in/out 两种，不支持 inout，nameOut 的为out参数，完备
    maxSize: '', // in参数自动，out参数默认200，需要能支持配置，如果统一lob单独取，则一般200字节够用
    type: '', // in参数自动判断，out参数可以指定 nameOutNumber，nameCur 代表out返回游标
  },
  autoCommit: false, // fixed. default to oracledb.autoCommit, that osql set to false
  batchErrors: false, // fixed. 目前是写死false的，先确保事务严谨性，以牺牲灵活性为代价
  dmlRowCounts: true, // fixed.
 })
```

## 特殊绑定参数配置
- bindObj.name.maxSize : 200
- bindObj.name.maxArraySize : 100
- option.extendedMetaData : true
- options.outFormatArray : 1
- option.batchErrors : 0
