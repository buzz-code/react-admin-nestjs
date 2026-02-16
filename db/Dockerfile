FROM mysql:8.4

COPY data.sql /docker-entrypoint-initdb.d/10-data.sql
COPY init-grants.sh /docker-entrypoint-initdb.d/20-init-grants.sh