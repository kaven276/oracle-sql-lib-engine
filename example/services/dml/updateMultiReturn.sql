update osql_main set
  status = :status
returning cust_name,  create_time
  into :custNameOut, :createTimeOut
