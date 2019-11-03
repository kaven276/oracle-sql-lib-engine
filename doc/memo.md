Error: DPI-1047: Cannot locate a 64-bit Oracle Client library: "libclntsh.so: cannot open shared object file: No such file or directory". See https://oracle.github.io/odpi/doc/installation.html#linux for help
Node-oracledb installation instructions: https://oracle.github.io/node-oracledb/INSTALL.html
You must have 64-bit Oracle client libraries in LD_LIBRARY_PATH, or configured with ldconfig.
If you do not have Oracle Database on this computer, then install the Instant Client Basic or Basic Light package from 
http://www.oracle.com/technetwork/topics/linuxx86-64soft-092277.html


https://docs.oracle.com/cd/E11882_01/network.112/e10835/sqlnet.htm#NETRF209
cat $ORACLE_HOME/sqlnet.ora
SQLNET.EXPIRE_TIME = 1
