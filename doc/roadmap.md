
## 开发简便
* ({}) = sql`text` 支持条件关闭行，数组，字符串带入 
* [] 直接在 .sql 文件中写动态 sql，转成 ({}) = sql`text` 模式
* 无需写 .js 文件，直接加载 .sql 文件，-- pool: task --title: xxx --converter: 

## 常见功能
* 无数据报错
* 只选第一行
* 分页 $pageSize $pageNo, 基于流获取结果集，每次取一页，指定页前的页忽略，指定页返回，然后提前中断查询

## 动态 DML
* insert/update table,{key:value} 插入指定表，字段名字段值map传入
* upsert
* 插入更新子表横表
* 插入更新子表纵表
* 同时插入主表子表

## 复杂sql
* clob/blob 字段支持
* 数组绑定支持
* plsql 多结果集整合

## 集成
* graphQL 集成

## 事务支持
* 内部分步式事务支持，两阶段提交
* 外部分步式事务支持，两阶段提交

## 安全
* delete/update all 告警

## 性能优化
* 慢 sql 日志
* 并发量大的 sql 日志
* 动态 sql 文本缓存，不每次解析动态 sql，可以直接复用之前的解析结果
* cursor cache group，相同的sql尽量使用固定的一组连接，最小化 sql parsing

## 网站
* logo + 一句话 sql-as-a-service  qaas
