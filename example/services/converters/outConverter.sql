-- title: outConverter demo
-- desc : 条件行 in数组绑定 拼入字符创

-- inConverter 会在执行sql前执行，修改或者衍生出新的请求参数，见下行范例，没有blocks参数默认给赋值100000
-- inConverter0: (req) => { !req.blocks && (req.blocks = 1000000)}
-- inConverter: (req, {maxBlocks}) => { !req.blocks && (req.blocks = maxBlocks)}
-- maxBlocks: 1000000

-- outConverter: echartFeed
-- chartTitle: table info
-- arrName: tables

select a.TABLE_NAME
  , a.TABLESPACE_NAME, BLOCKS
  , a.PARTITIONED, a.TEMPORARY, a.SECONDARY
  from user_tables a
 where 1 = 1
   and a.blocks > to_number(:blocks) --${!!blocks}
   and rownum < 10
