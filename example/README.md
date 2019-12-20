本目录为范例 sql 库，实际的应用库参考本目录开发。


目录和文件说明
============
- package.json 为 nodejs 工程描述文件，主要用于引用 oracle-sql-lib-engine；以后可能脱离关系就不用了
- .osqlrc.js 服务配置，主要指定各类文件路径，服务参数，如执行超过多长时间算是慢SQL
- services 目录存放所有的 SQL 文件，或者叫模块
- pools 目录存放所有的连接池的配置，每个 pool.name.js 存放名为 name 的连接池的配置，参数和 node-oracledb 驱动的连接参数一致

基于开源软件包 oracle-sql-lib-engine 的 sql 服务库。

详情请见 `npm home oracle-sql-lib-engine`

基于本项目创建新项目指导
====================

- 创建空目录, `git init` 初始项目
- 拷贝本范例 package.json 到新项目根，做相应修改，如项目 name 等
- 创建 pools, services 目录
- pools 目录中拷贝本范例 pool.xxx.js 按自己需要修改，建议 pool 名叫 pool.default.js
- services 目录下创建 test.sql 里面随便写如 `select * from dual` 做测试用
- npm start 启动服务，然后通过浏览器或curl等各种方式测试 /test 路径是否正常执行

本机开发调试
==========

```
LOCAL_DEV=1 UV_THREADPOOL_SIZE=100 ENV=stage PORT=3014 DEBUG='osql:pools,osql:exec'  npm start
```

说明：
1. LOCAL_DEV=1 代表使用安全代理访问，详见 pools 目录下连接池配置，主要控制连接池在开发时使用较少的连接，防止服务端连接数资源占用太多
2. UV_THREADPOOL_SIZE 需要大于所有连接池设置连接池之和，再加大 20 左右，因为 oracle 驱动为每个连接池连接创建单独的辅助线程(OCI协议决定的) 
3. ENV=prod, ENV=stage, ENV=test 分别设置访问生产，预发布，测试环境
4. PORT=1520 服务监听端口，默认 1520
5. DEBUG='osql:xxx' 打开 osql 特定类型的带颜色日志，pools 连接池活动，services 服务加载活动，exec 服务执行细节，如请求响应，sql文本，绑定参数等等

运维
====

## 查看连接池状态

知道连接池是否够用非常重要，系统提供了地址为 "/$admin/pool" 的服务用于查看连接池占用状态

- 查看全部连接池状态范例: `curl 'http://127.0.0.1:3014/$admin/pool' | json_reformat`
- 查看指定名称如task连接池的状态范例: `curl 'http://127.0.0.1:3014/$admin/pool/task' | json_reformat`

```shell
查看全部连接池状态范例
curl -s 'http://127.0.0.1:3014/$admin/pool' | json_reformat 
[
    {
        "poolName": "tjo2odb",
        "connectionsInUse": 0,
        "connectionsOpen": 15,
        "poolMax": 15,
        "free": 15
    },
    {
        "poolName": "task",
        "connectionsInUse": 0,
        "connectionsOpen": 10,
        "poolMax": 10,
        "free": 10
    },
    {
        "poolName": "kafka",
        "connectionsInUse": 0,
        "connectionsOpen": 15,
        "poolMax": 15,
        "free": 15
    }
]

# 查看指定名称如task连接池的状态范例:
curl -s 'http://127.0.0.1:3014/$admin/pool/task' | json_reformat
{
    "poolName": "task",
    "connectionsInUse": 0,
    "connectionsOpen": 10,
    "poolMax": 10,
    "free": 10
}


```

## 查看 osql bunyan 日志

bunyan 日志模块文档详情请见 `npm home bunyan`

```shell
[wosale@xxappsrv-2 ~/.pm2/logs]$cd ~/.pm2/logs
[wosale@xxappsrv-2 ~/.pm2/logs]$pwd
/home/wosale/.pm2/logs

[wosale@xxappsrv-2 ~/.pm2/logs]$ls -lt |grep osql
-rw-r-----  1 wosale wosale   1626345 11月  8 14:45 osql0.log
-rw-r-----  1 wosale wosale     39960 11月  8 07:58 osql0.log.0
-rw-r-----  1 wosale wosale       957 11月  8 00:45 osql1.log

# osql 服务集群方式启动，但是平常只用一个节点，就是0号服务，日志对应的是 osql0.log

# 查看最近的 error
cat osql0.log | bunyan -l error | tail

[2019-11-08T06:46:56.489Z] ERROR: osql/1120 on xxappsrv-2: (type=error, errorType=unknown, err={})
    { path: '/task/qryRemark',
      req: { key: '/task/20191106131019835866/0/remark' } }
[2019-11-08T06:46:57.037Z] ERROR: osql/1120 on xxappsrv-2: (type=error, errorType=unknown, err={})
    { path: '/task/qryRemark',
      req: { key: '/task/20191108142810260330/0/remark' } }

# 范例：查看告警级别的，类型为 slow，执行时间大于 100000ms 的记录。
cat ~/.pm2/logs/osql0.log | bunyan -l warn -c 'this.type="slow" && this.executionTime>100000'

[2019-11-08T00:30:17.597Z]  WARN: osql/11973 on xxappsrv-yfb: (type=slow, executionTime=83459)
    { path: '/flowMonitor/funnel/root/xx_shouli_reach',
      req: 
       { _cache: { maxAge: 7200 },
         stime: '20191101',
         etime: '20191108' } }
[2019-11-08T00:30:18.232Z]  WARN: osql/11973 on xxappsrv-yfb: (type=slow, executionTime=84091)
    { path: '/flowMonitor/funnel/root/xx_jungong_reject',
      req: 
       { _cache: { maxAge: 7200 },
         stime: '20191101',
         etime: '20191108' } }
[2019-11-08T00:30:23.871Z]  WARN: osql/11973 on xxappsrv-yfb: (type=slow, executionTime=89733)
    { path: '/flowMonitor/funnel/root/xx_jungong_reach',
      req: 
       { _cache: { maxAge: 7200 },
         stime: '20191101',
         etime: '20191108' } }

# 范例：查看所有不是慢的告警
cat osql0.log | bunyan -l WARN -c 'this.type != "slow"'

[2019-11-08T02:37:04.616Z] ERROR: osql/1120 on xxappsrv-2: (type=error, errorType=unknown, err={})
    { path: '/task/qryRemark',
      req: { key: '/task/20191107171610109143/0/remark' } }

```


注：bunyan 做了 alias，指向 oracle-sql-lib/node_modules/.bin/bunyan

## 运维工作

### 障碍处理工作
- 收到前台报障后，点击调用状态三下看到调用路径为 /ms/osql 开头的为调用本服务
- 如果错误信息为连接池等待超时异常，则查看连接池占用情况，然后参考下面“连接池保护工作”处理
- 其他问题查看 osql bunyan 日志，看有何异常，定位是哪个服务模块也即.sql文件异常，然后做分析处理

### 研发自测和持续优化
- 研发本地测试sql模块时，osql.log 记录在本项目根下，研发人员自己查看日志，对慢sql进行关注和优化
- 运维和DBA每日查看 osql bunyan 日志，分析异常和慢日志，特别对慢 sql 进行分析和优化

### 找到对应的研发人员
- 根据定位到的模块路径在本 git repo 最新版本里面查看
- 执行 `git log -p --stat -- services/a/path/to/buggy/file.sql` 找到对应的提交git的研发人员
- 联系导致问题的研发人员和DBA一起分析解决问题，重新提交解决后的版本，安排升级

### 连接池保护工作
- 如果发现有获取不到连接池原因，可能有以下情况，需要确定类型后分别处理
- 新上线和改动的 sql 模块慢，导致占用连接池连接时间变长，最终导致连接池连接被占满
- 不同应用，如行销和AI，访问同一个库，但是配置不同的连接池，互相隔离，互不影响
- 在目录级或者文件级别，配置sql模块的 concurrency 参数，防止单个模块慢由大量执行占用过多连接数
