-- select into 只能放在 plsql block 中
begin
  select a.trade_id into :tradeIdOutNumber
  from osql_main a
  where a.cust_name = :custName;
end;
