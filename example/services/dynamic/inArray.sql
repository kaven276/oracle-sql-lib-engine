select a.TABLE_NAME
  , a.TABLESPACE_NAME, BLOCKS
  , a.PARTITIONED, a.TEMPORARY, a.SECONDARY
  from user_tables a
 where a.table_name in ('${tnames}')
