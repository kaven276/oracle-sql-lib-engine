create table osql_sub(
  trade_id number(12) references osql_main,
  item_key varchar2(30),
  item_val varchar2(200)
)
