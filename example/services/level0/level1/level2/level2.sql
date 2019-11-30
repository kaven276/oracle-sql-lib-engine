-- desc: use inConverter from osql.config.js exports demo
-- inConverter: addNameToIn
-- name: level2

select '${name}' as "concatName", :name "bindName" from dual
