本目录为范例 sql 库，实际的应用库参考本目录开发。


范例：启动，并且控制台能看到连接池活动日志和 sql 执行日志
```shell
DEBUG='osql:pools,osql:exec' UV_THREADPOOL_SIZE=20 node .
```

目录和文件说明
- package.json 为 nodejs 工程描述文件，主要用于引用 oracle-sql-lib-engine；以后可能脱离关系就不用了
- .osqlrc.js 服务配置，主要指定各类文件路径，服务参数，如执行超过多长时间算是慢SQL
- services 目录存放所有的 SQL 文件，或者叫模块
- pools 目录存放所有的连接池的配置，每个 pool.name.js 存放名为 name 的连接池的配置，参数和 node-oracledb 驱动的连接参数一致
