-- http://127.0.0.1:1520/typebind/bindNull 不返回记录
-- http://127.0.0.1:1520/typebind/bindNull?none=1 返回记录

select sysdate from dual where :none is not null
