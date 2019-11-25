create or replace procedure osql_prepare_data(sts varchar2 := '0', count out number)
is
begin
  delete from osql_main;
  insert into osql_main (trade_id,create_time,cust_name, status) values (osql_seq_trade_id.nextval, sysdate, 'LiYong', sts);
  insert into osql_main (trade_id,create_time,cust_name, status) values (osql_seq_trade_id.nextval, sysdate, 'LiXiyan', sts);
  insert into osql_main (trade_id,create_time,cust_name, status) values (osql_seq_trade_id.nextval, sysdate, 'LiYuze', sts);
  select count(*) into count from osql_main;
end;
