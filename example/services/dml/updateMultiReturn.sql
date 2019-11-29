update osql_main set
  status = :status
where 1 = 1
returning cust_name,  create_time
  into :custNameOut, :createTimeOut
