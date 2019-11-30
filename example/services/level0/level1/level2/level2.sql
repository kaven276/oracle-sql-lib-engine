-- desc: use inConverter from osql.config.js exports demo
-- inConverter: addNameToIn

select '${name}' as catstrName, :name bindName from dual
