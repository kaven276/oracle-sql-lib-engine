begin
  return;
  -- will get exception for cursor out bind when cursor is not open
  open :testCur for select * from dual;
end;
