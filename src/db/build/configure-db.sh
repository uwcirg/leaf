#!/bin/bash

# Wait 60 seconds for SQL Server to start up by ensuring that
# calling SQLCMD does not return an error code, which will ensure that sqlcmd is accessible
# and that system and user databases return "0" which means all databases are in an "online" state
# https://docs.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-databases-transact-sql?view=sql-server-2017

PATH=$PATH:/opt/mssql-tools/bin/

TIMEOUT=60

DBSTATUS=1
EXIT_CODE=1
i=0
while [ $i -lt $TIMEOUT ]; do
    i=$(($i+1))
    DBSTATUS=$(sqlcmd -h -1 -t 1 -U sa -P $SA_PASSWORD -Q "SET NOCOUNT ON; Select SUM(state) from sys.databases" 2>/dev/null)
    EXIT_CODE=$?

    if [ $EXIT_CODE -eq 0 ] && [ "$DBSTATUS" -eq 0 ]; then
        break;
    fi
    sleep 1
done

if [ "$DBSTATUS" -ne 0 ] || [ $EXIT_CODE -ne 0 ]; then
    echo "SQL Server took more than $TIMEOUT seconds to start up or one or more databases are not in an ONLINE state"
    exit 1
fi

result=$(sqlcmd -b -S localhost -U sa -P "$SA_PASSWORD" -Q"IF EXISTS (SELECT 1 FROM sys.databases WHERE [name] = N'LeafDB')print 'EXISTS'")
if [ "$result" = EXISTS ]; then
    echo DB exists; skipping initialization
    exit 0
fi

echo initializing DB...
# Run the setup script to create the DB and the schema in the DB
sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -d master -i /opt/mssql/setup.sql
echo done loading setup.sql

# read all SQL files in given directory /docker-entrypoint-initdb.d
for sql_file in /docker-entrypoint-initdb.d/*.sql; do
    echo loading $sql_file
    sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -d LeafDB -i $sql_file > /dev/null
    echo done loading $sql_file
done
