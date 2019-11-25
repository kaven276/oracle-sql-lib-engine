delete osql_main where trade_id = :tradeId
returning cust_name, status into :custNameOut, :statusOut
