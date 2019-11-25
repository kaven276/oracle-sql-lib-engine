declare
  v osql_main%rowtype;
begin
  v.trade_id := :tradeId;
  delete from osql_main a where a.trade_id = v.trade_id
  returning a.cust_name into v.cust_name;
  if v_cust_name = 'LiYong' then
    raise_application_error(-20000, 'you can not delete cust LiYong');
  end if;
end;
