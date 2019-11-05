目的：保存全部应用需要的 sql

关于 node-oracledb
==================
* 本软件基于 node-oracledb 访问 oracle 数据库
* 安装参考 https://oracle.github.io/node-oracledb/INSTALL.html#quickstart
* 默认 http 响应完全同 node-oracledb 执行 sql/plsql 返回的结果，但是可以调整

## 安装参考

https://oracle.github.io/node-oracledb/INSTALL.html#mig31

Add Oracle 18, 12, or 11.2 client libraries to your operating system library search path such as PATH on Windows or LD_LIBRARY_PATH on Linux. On macOS move the libraries to ~/lib or /usr/local/lib

Oracle Client libraries 18 and 12.2 can connect to Oracle Database 11.2 or greater. Version 12.1 client libraries can connect to Oracle Database 10.2 or greater. Version 11.2 client libraries can connect to Oracle Database 9.2 or greater.

Oracle client 11.2 requires the Visual Studio 2005 Redistributable. https://www.microsoft.com/en-us/download/details.aspx?id=3387


运行
-----

window

场景
======
- 前台只需要某些数据库的内容，直接配置 sql 和连接池的名称即可使用
- 配置参数格式和 plsql-developer IDE 中的写法一致，和 oracle driver 一致
- http 请求中的参数可以直接用于 sql 参数绑定
- 可以设置 map 函数将 http 请求中的参数绑定到 sql 绑定参数
- 引用 filename.sql 文件，方便使用 plsql-developer IDE 进行编辑
- 向 mbss-mock-server 一样，写各个路径下的配置，exports.dbPoolName, exports.
- 可以零中断升级, scale 2 即可

原则
======
* 全部 oracle 数据库访问逻辑(sql/plsql) 集中管控，方便集中管控，集中分析评估，集中优化，集中加固等集中管理工作，节约数据库连接资源
* 不仅面向开发和运行，支持超便捷调式，自动回归测试，范例拾取用作调用方代码模板，热部署等开发部署流程上的便捷措施


```javascript
exports.path = 'api path';
exports.title = '说明';
exports.sqltext = `select * from dual`;
exports.pool = 'task';
exports.concurrency = 2; // 最大并行度为2，当前path服务在途到达该限额，再访问同一服务直接报错，防止个别有问题个别 sql 占用全部的连接池资源
exports.inConverter = (req) => {params};
exports.outConverter = (sqlResult, request) = {}; // 将标准 node-oracledb sql 执行响应做处理返回最终 http json 响应
```

开发调式
==========

## 输出调试信息

范例：使用 LOCAL_DEV vpn 连接，输出连接池和sql执行的日志，按预发布环境连库
```shell
LOCAL_DEV=1 DEBUG='osql:pools,osql:exec' ENV=stage node .
```

运维
======

## 查看连接池状态

知道连接池是否够用非常重要，系统提供了地址为 "/$admin/pool" 的服务用于查看连接池占用状态

- 查看全部连接池状态范例: `curl 'http://localhost:3014/$admin/pool'`
- 查看指定名称如task连接池的状态范例: `curl 'http://localhost:3014/$admin/pool/task'`

机制
========
- 服务启动扫描全部 services 目录
- 加载全部服务配置
- 接收到请求找到对应的配置
- 按配置 prepare sql, 准备sql参数(可能和请求，也可能通过转换函数)
- 按照参数绑定方式执行 sql
- 执行前设置 module, action，无设置从 path 推导，方便 v$session 查看，方便应用oracle资源分配管理
- `await c.execute(sqltext, params, options)`
- 全部使用参数绑定

设计考虑
==========
- keep 到各个 oracle databases 各个用户的链接池，但是不带任何业务，接受 http 发过来的请求，执行 oracle sql 操作返回 http 结果
- 请求报文只要包含基本的 sql, bind params, options 即可，最后看结果
- 对于游标类型，返回 stream
- 可能采用 moleculor 方式集成，每个数据库单独由一个 moleculor 微服务管理

和专门写 java 程序比较
====================
* 会写 sql 基本上马上可以上手后台(面向数据库)开发工作
* 前端开发人员可以前后台一起做
* 直接支持零中断升级，快速迭代，快速前后台联调
* 极简，纯干货，无需 controller/services 层，直接写 sql 配置，就能访问
* 自带限流，合理分配连接池连接资源
* 直接使用 es6 模板串灵活生成 SQL；更多需求可以使用 mustache 等大量第三方模板写 sql，功能类似 mybatis
* 可以使用第三方的 query builder，打算集成 type-orm

开放性扩展性
============
* 可以集成各种js常用的模板渲染库，用来生成SQL文本，包括 mustache...，需要自定义

Q/A
========

## 既然服务组织都在 services 下，通过 exports.xxx 配置，服务启动自动扫描加载，和 mbss-mock-server 相似，为什么不合并到一个项目中

1. 因为本服务依赖 node-oracledb，后者又依赖于主机安装和配置 oracle client 库，会造成开发者的不便
2. 本服务使用需要配置数据库连接，不方便


注意
====

## oracle client 安装

因为目前本地的 oracle 库最低的也是最核心的库的版本为 10.2.4，因为需要安装 instantclient_12_1，再高版本的客户端只能连接更高版本的数据库。

### 报错 24408 处理
{ [Error: ORA-24408: could not generate unique server group name] errorNum: 24408, offset: 0 }

参考 https://www.cnblogs.com/enjoycode/p/3542739.html

instant client requires a /etc/hosts file entry for your hostname pointing to 127.0.0.1

Assuming your host name is foomachine, there are two places you'll need to check:

In /etc/hosts, make sure you have any entry like - add it if it's not there:

    127.0.0.1   foomachine

在/etc/hosts中保证127.0.0.1后面有刚才设置的HOSTNAME

## 数字性精度问题

超过 64 js 精度，末位3变成4了，需要对长度超过 16为十进制数字，64位二进制js数使用 to_char 或者按照字符串配置返回。

历史范例
```
curl -v http://127.0.0.1:3014/payFee/qryAcctInfosBySerilNumber?serialNumber=11200154688
"ACCT_ID": "9117033134336504", -- 错误的，因为超过 64 js 精度，末位3变成4了，
"ACCT_ID": "9117033134336503", -- 正确的
```

js 最大精度整数和错误数据比对

```
9007199254740992 -- Math.pow(2,53)
9117033134336503 -- acct_id
```

todo
===========

## pool 相关
* db pools 在 pool 目录可以配置多个，自动扫描
* db pool 配置 oracledb.createPool 的参数，或者直接调用 createPool
* db pool 别名自动为当前文件名称
* cluster 模式启动每个 pool 连接数配置自动按并发量调整
* 能够配置默认pool参数，当特定pool没有配置相关参数时自动设置上
* 能够配置开发强制pool参数，默认每个数据库只有一个连接，防止太多开发者同时运行对数据库造成压力

## sql 类型支持
* 执行 select info 到对象，其实选中一行也是一样的
* 执行 DML 操作，所有 out 参数，需要配置 out 参数列表，和生成的 out 比对，或者 out 参数都命名为 outXXX
* 直接执行 begin...end 存储过程，作为落数据或者提交类的服务，不再局限于查询
* 异常，特别是数据库异常处理

## 调式，测试，部署，安全，运维
* 能够将 pool 配置和 services 目录独立成不同的项目
* 每个 pool 的密码取自使用环境变量，不打入版本中
* 支持 service 目录内容变化自动热加载，快速的调试，无中断平滑升级

## 组合和事务
* 能够联合多个 service 组成全局事务
* 联合多个事务支持最终一致性

## 模块热加载
* 每个原子服务模块都是一套 exports 配置，为了能方便的访问到组成成员
* 最终每个原子服务都会被生成器高阶函数封装成一个请求-调用db-响应的 async 函数
* 全部服务的 path 为 key 映射对应的  require module，形成服务注册 hash
* http 外部请求到达时，从服务注册表找到对应的 module，按 module 配置执行 
* 监听 services 目录，当一个模块发生变化时，更新对应 key 的 module

## 链接池变更热更新
* 所有的数据库连接池无需断开重新生成
* pm2 服务无需整体重启（当然核心代码改动需要）
* 新增数据库连接配置也无需重启，识别出新增配置，直接根据新配置文件创建新数据库链接池

## 熔断，过载保护，访问异常保护
* 系统记录每个 db 的访问情况，总失败会对所有访问该 db 的请求进行熔断
* 系统记录每个模块的执行情况，发现时间增大，总超时，总报错，自动进行熔断
* 可以配置每个服务的最大允许并发数，超过则直接报错，过载保护；没有配置自动取 poolMin 的三份之一作为默认并发阀值
* 自动拦截服务配置的pool不存在的请求，返回报错信息
* 数据库重启本服务无需人工干预，数据库恢复本服务自动感知自动恢复

## 自动版本记录和版本变更保护
* 每当升级 services 目录内容，系统自动记录 git 版本变更
* 当新版本模块访问出现 sql parsing error 时，自动回退到上一可用的版本

## 数据库管理支持
* 每个连接标明 module="oracle-sql-lib' action=path
* 每个连接标明 client_identifier 为 staffId 或者 callId(client call id)
* 自带DBA管理界面，查询所有本模块发起的会话，锁情况，等待情况
* 自动发现缺少参数绑定的情况

## 自动测试
* 启动时和模块变更时，自动执行预置的请求测试，出测试保护，有问题告警并记录日志

## 数据库数据修正工具
* 按照测试入参描述，自动生成表单，供维护人员做数据维护使用
* 方便积累常用的维护 SQL
* 可以关联多个模块，形成一个特性主体的维护界面

为什么使用？
===========
* v$session 里面 module 看到是本模块的问题会话问题SQL，action对应是哪个路径的模块，DBA可快速定位回溯到数据库操作的源码
* 零中断升级，随时优化，随时解决问题，随时上线新模块，不用影响在用业务
* 能收集和封装全部数据访问层的逻辑，包括多个不同的库，oracle和非oracle库。利于实行专业化管理。
* 前端代码可以直接访问

## 和 java mybatis 比较
* 直接连接 http api 到 DAO 模块，变内部功能为外部 API
* 多出热加载热更新等机制
* SQL模板可以使用默认的 javascript 新版本方式，还可以使用大量的 js 模块库扩展
* 带自测

## 和 codecode 方案比较
* SQL 库完全的代码化版本化管理
* oracle-sql-lib 访问采用 url http 访问，而 codecode 需要同步和每次表中按 key 取 sql
* codecode 的 sql 只能是静态 sql，oracle-sql-lib 可以是动态 sql，更灵活强大

## 和 stored procedure 存储过程比较
* 两者写 plsql 完全一样，都可以使用 plsql 的各种语法和功能，如方便的 for-loop, %rowtype 等简洁语法
* oracle-sql-lib 的参数绑定就相当于存储过程的参数和返回值
* 存储过程版本管理，更新部署困难，oracle-sql-lib 完美解决了前面问题
* 存储过程无法实现预发布版本部署(因为预发布数据库就是生产数据库)，oracle-sql-lib 没问题
* oracle-sql-lib 可以在运行期间热更新模块，而存储过程在执行时无法更新(还容易引发级联锁导致全局障碍)
* 存储过程只能部署在目标库中，oracle-sql-lib 可以将多个库甚至全部库的 sql 模块集中管理
* 在 oracle-sql-lib 中执行，v$session(module,action) 监控更方便容易
* 在 oracle-sql-lib 中执行，提供额外的DBA优化支持，如慢 sql 日志，慢 sql 自动找到对应的执行计划等等

练习场景
========
* 创建表
* 插入记录
* 查询
* 修改记录
* 删除记录
* 参数绑定
* 动态SQL
* 参数绑定输出变量
* 返回游标
* 返回多个游标
* 执行 plsql
* 执行 plsql 里面 plsql/sql 分别带输入绑定变量
* 执行 plsql 里面 plsql/sql 分别带输出绑定变量
* 输出绑定变量配

todo
=======

待试验 cursor 相关
------
* 返回 select cursor select 字段中有嵌入 cursor暂时不支持
* 返回 sys_refcursor, ok

简化配置
-------
* in bind 直接使用 json 入参中的类型自动推断，无需配置
* 如果 bind 没有找到对应的入参，则自动推断成 out 类型
* 如果 out bind 没有配置，默认就是 String 或者根据以下属性名称自动推断
* outBind 类型推测
  - xxxList xxxArr xxxCur 都代表是 bind.type = oracledb.CURSOR
  - xxxDate xxxTime 都代表是 bind.type = oracledb.DATE
  - xxxCount xxxAmount xxxNum 都代表是 oracledb.NUMBER
  - 其他默认都认为是 string

结果转换
-------
* 返回 one-row-object 还是 rows ?
  - 叫 xxxInfo 返回一行
  - 叫 xxxList 返回多行
* 主表子表关联返回，适用于一个主表多个子表情况
  - 主子两个或多个游标，指定关联键值，主表上一个键值一条记录，对应子表多条记录
  - 指定主表子表关联函数，(parentRow, childRow) => (parentRow[key] === childRow[key]) 用于确定是一条记录。

plsql打开osql

* 在plsql中选择Configure-》File Browse Locations-》点击右上角按钮新加一个location，并选择目录，并且添加描述-》然后右键选中要执行的sql'文件，以test的方式打开，在窗口下方便可填入绑定参数

其他
-------
* 生产，测试，预发布 pool 配置
* 事务支持
* 闭环测试

/$dev/serviceList 查看全部服务清单，可以搜索 path,title，最后改动的排到最前面
/$dev/path 显示 exports.request 数据的 json，用户可以修改，点击执行，在新窗口中显示结果，post data=JSON-escaped

