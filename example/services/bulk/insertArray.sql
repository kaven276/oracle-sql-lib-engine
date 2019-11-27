DECLARE
  v_cust_names osqlarr.varchar2_array := :custNames;
BEGIN
  FORALL i IN INDICES OF v_cust_names
    INSERT INTO osql_main (trade_id, create_time, cust_name, status)
    VALUES (osql_seq_trade_id.nextval, sysdate, v_cust_names(i), '2');
END;
