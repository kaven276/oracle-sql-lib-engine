-- :bindVal 如果没传，绑定空字符串，也就是 null
-- http://127.0.0.1:1520/typebind/bindNull 不返回记录
-- http://127.0.0.1:1520/typebind/bindNull?none=1 返回记录

select sysdate, nvl(:none, 'v') as none from dual
where :none is null or :none = '1'
