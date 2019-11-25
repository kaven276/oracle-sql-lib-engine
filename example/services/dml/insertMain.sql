insert into osql_main(
  trade_id,
  create_time,
  cust_name
) values (
  osql_seq_trade_id.nextval,
  sysdate,
  :custName
)
