begin
  SELECT a.cust_name, a.status BULK COLLECT
  INTO :custNameOutArr, :statusOutArr FROM osql_main a;
end;
