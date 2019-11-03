node.oracle-sql-lib 安装说明
============================

项目 git 维护地址在公司vpn内网，地址：
---------------------------------
- git 协议： git@10.1.130.19:tjs/node.oracle-sql-lib.git
- http协议：  http://10.1.130.19/tjs/node.oracle-sql-lib
- 需要在 vpn gitlab 上注册账号(用户名邮箱前名称，全称中文实名，邮箱亚信邮箱)，然后找管理员加访问权限

## 集成 nodejs oracle 驱动的说明

- 当前 node-oracledb 驱动版本是 3.1.2，对应的 nodejs 版本是 v10
- https://oracle.github.io/node-oracledb/INSTALL.html#mig31
- https://github.com/oracle/node-oracledb/blob/v3.1.2/INSTALL.md
- windows 环境变量 PATH 包含oracle安装可执行文件目录如 C:\oracle\product\12.2.0\dbhome_1\bin
- windows 环境变量 TNS_ADMIN 设置包含 tnsnames.ora 的目录 （可选)

## 安装准备条件

1. 安装 git ，用于下载版本库和进行版本协作。https://git-scm.com/download/
2. 安装 nodejs，osql的运行环境。v10 (不能v12)。https://nodejs.org/en/
3. 安装 db 客户端驱动，vpn内网 http://10.1.130.19/tjs/etc.tools/ 已经从oracle官网下载好的
   或者从静态文件服务下载(因为vpn经常网络拥堵)
   - 如果机器上已经安装过，则跳过。如果安装 instantclient，参考此步
   - http://60.28.151.83:50080/etc.tools/instantclient_12_1_windows.zip
   - http://60.28.151.83:50080/etc.tools/instantclient_12_1_mac.zip
4. vscode 主要用于写模块配置和转换器函数，带 eslint 自动更正集成，保证代码规范
5. plsql developer 用于调试 sql/plsql

## 操作步骤范例

```shell
git clone http://10.1.130.19/tjs/node.oracle-sql-lib
cd node.oracle-sql-lib
yarn # 安装依赖，特别是 nodejs oracledb 驱动包(集成oracle客户端库)，windows 下在 powershell/cmd 下执行
node . # 本地运行 如果走维护VPN通道，设置 LOCAL_DEV=T node . 启动，配置访问权限后可以从公网访问数据库
````
