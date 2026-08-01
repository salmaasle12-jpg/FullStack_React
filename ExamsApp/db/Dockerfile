FROM postgres:16

ENV POSTGRES_DB=examsdb
ENV POSTGRES_USER=examsuser
ENV POSTGRES_PASSWORD=examspassword

COPY init.sql /docker-entrypoint-initdb.d/