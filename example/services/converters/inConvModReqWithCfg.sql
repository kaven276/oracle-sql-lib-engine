-- desc: 修改设置请求参数，符合sql参数绑定要求
-- inConverter : (req, m) => { req.tname = (req.tprefix || m.prefix).toUpperCase() + '%'}
-- prefix: osql

select a.TABLE_NAME
  , a.TABLESPACE_NAME, BLOCKS
  , a.PARTITIONED, a.TEMPORARY, a.SECONDARY
from user_tables a where a.table_name like :tname
