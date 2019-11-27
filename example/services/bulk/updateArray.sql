declare
  tradeIdList  osqlarr.number_array:= :tradeIdList;
BEGIN
  FORALL i IN INDICES OF tradeIdList
    update osql_main a set a.status = '3' where a.trade_id = tradeIdList(i);
END;
