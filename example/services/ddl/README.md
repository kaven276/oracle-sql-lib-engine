创建 example 用的表，索引，序列

```shell
OSQLBASE='http://127.0.0.1:1520'
curl $OSQLBASE/ddl/createTableMain
curl $OSQLBASE/ddl/createTableExt
curl $OSQLBASE/ddl/createTableSub
```
