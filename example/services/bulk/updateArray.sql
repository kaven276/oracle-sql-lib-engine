BEGIN
  FORALL i IN INDICES OF :tradeIdList
    update osql_main a set a.status = :status where a.trade_id = :tradeIdList(i);
END;
