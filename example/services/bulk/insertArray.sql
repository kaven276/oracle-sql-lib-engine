BEGIN
  FORALL i IN INDICES OF :custNames
    INSERT INTO osql_main (trade_id, create_time, cust_name, status)
    VALUES (osql_seq_trade_id.nextval, sysdate, :custNames(i), :status);
END;
