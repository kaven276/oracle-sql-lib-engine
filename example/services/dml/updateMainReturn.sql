update osql_main set
  status = :status
where trade_id = :tradeId
returning cust_name into :custNameOutString
