
BEGIN
  FORALL i IN INDICES OF :tradeIdList
    delete from osql_main a where a.trade_id = :tradeIdList(i);
END;
