create table osql_ext(
  trade_id number(12) references osql_main,
  goods_type varchar2(30)
)
