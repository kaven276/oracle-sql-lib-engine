create table osql_main(
  trade_id number(12) primary key,
  create_time date,
  cust_name varchar2(10),
  status char(1) default '0'
)
