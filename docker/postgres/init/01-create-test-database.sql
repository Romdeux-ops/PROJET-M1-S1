-- Execute une seule fois, a la creation du volume PostgreSQL.
-- Fournit une base isolee pour ./gradlew test afin que les tests ne touchent
-- jamais aux donnees de developpement.
CREATE DATABASE fitcoach_test OWNER fitcoach;
