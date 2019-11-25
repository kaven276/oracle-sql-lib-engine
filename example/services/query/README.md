数据查询

- select 无参数绑定：queryMainBaisc.sql
- select 有参数绑定: queryMainParam.sql
- select into: selectMainInfo.sql

```shell
OSQLBASE='http://127.0.0.1:1520'
curl "$OSQLBASE/query/queryMainBasic"
curl "$OSQLBASE/query/queryMainParam?custName=Li" # return 3 rows
curl "$OSQLBASE/query/queryMainParam?custName=LiY" # return 2 rows
curl "$OSQLBASE/query/selectMainInto?custName=LiYong" 
```
