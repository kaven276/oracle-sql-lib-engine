declare
  v_type varchar2(10) := lower(:type);
begin
  if v_type = 'table' then
    open :objectsCur for
      select * from user_tables where table_name like :pattern;
  elsif v_type = 'index' then
    open :objectsCur for
      select * from user_indexes where index_name like :pattern;
  else
    raise_application_error(-20000, 'wrong type to select');
  end if;
end;
