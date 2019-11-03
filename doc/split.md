分离出 oracle-sql-engine

- oracle-sql-engine 指定配置文件，里面有端口号，等等等等
- 原来的 oracle-sql-lib 只剩下应用层面的文件
- oracle-sql-lib 不再需要 package.json 里面的大量依赖，基本上独立使用了
- oracle-sql-lib 依然需要 node-oracle 因为需要里面的常量定义，考虑 oracle 如果也剥离成独立项目更好
- 可以拥有多个 osql 服务库，每个库都有自己的配置文件路径
