填充范例数据，演示 insert,update,delete，演示无 where update,delete 保护机制

* 一般插入
* 一般参数绑定更新
* 一般参数绑定删除
* 更新返回数据
* 删除返回数据 

```shell
OSQLBASE='http://127.0.0.1:1520'
curl "$OSQLBASE/dml/insertMain?custName=LiYong"
curl "$OSQLBASE/dml/insertMain?custName=LiXinyan"
curl "$OSQLBASE/dml/updateMainStatus?tradeId=1&status=9"
curl "$OSQLBASE/dml/deleteMain?custName=LiXinyan"
curl "$OSQLBASE/dml/insertMain?custName=LiXinyan"
curl "$OSQLBASE/dml/insertMainReturn?custName=LiYuze"
curl "$OSQLBASE/dml/updateMainReturn?tradeId=1&status=9"
curl "$OSQLBASE/dml/deleteMainReturn?tradeId=1"
```
