declare
  v osql_main%rowtype;
begin
  v.trade_id := :tradeId;
  -- select 1/0 into v.trade_id from dual;
  delete from osql_main a where a.trade_id = v.trade_id
  returning a.cust_name into v.cust_name;
  if sql%rowcount = 0 then
    raise_application_error(-20000, 'delete target not exist');
    -- will automatically rollback the whole plsql as a sql sentence
  end if;
end;
