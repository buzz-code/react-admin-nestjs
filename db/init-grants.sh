#!/bin/sh
set -e

mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
  GRANT SYSTEM_USER ON *.* TO '${MYSQL_USER}'@'%';
  FLUSH PRIVILEGES;
EOSQL
