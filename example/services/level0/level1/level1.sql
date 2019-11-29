-- a: sysdate as now

select ${a}, '1' as n, '${m.path}' as path, '${m.pool}' as pool from dual
