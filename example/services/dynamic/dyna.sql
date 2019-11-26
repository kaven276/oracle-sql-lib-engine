-- line switch and string interpolation
-- ifLine switch can control multi-lines with previous lines end with \
-- select columns can use ${xxx}
-- order by columns can use ${xxx}

select a.TABLE_NAME
 , a.TABLESPACE_NAME, BLOCKS --${!!verbose}
 , a.PARTITIONED, a.TEMPORARY, a.SECONDARY --${!!verbose}
 , ${colname}
  from user_tables a
 where 1 = 1
   and a.table_name like :tname || '%' --${!!tname}
   and a.blocks < to_number(:blocks) * 10 \
   and a.blocks > to_number(:blocks) --${!!blocks}
  order by ${orderBy}
