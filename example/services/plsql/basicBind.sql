declare
  -- use in-bind in declaration is more clear
  xing varchar2(30) := :xing;
begin
  -- use out-bind where produce it
  select count(*) into :countOut from osql_main where cust_name like xing || '%';
end;
