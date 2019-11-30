begin
  select count(*) into :tableCountOutNumber from user_tables;
  -- outBinds.indexCount will be null
  select count(*) into :indexCountOutNumber from user_indexes;
end;
