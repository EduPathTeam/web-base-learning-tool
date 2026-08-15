-- 002_add_sessions_table.sql
-- Adds the `sessions` table backing express-mysql-session (see
-- server/src/app.js), which replaces express-session's default in-memory
-- MemoryStore — unsuitable for production because sessions are lost on
-- restart and it leaks memory under sustained load.
--
-- Column names/types intentionally match express-mysql-session's own
-- built-in schema.sql exactly, since the library reads/writes these exact
-- column names itself. The table is created here (createDatabaseTable:
-- false in app.js) rather than via the library's auto-create, so schema
-- changes stay in one place per CLAUDE.md's migration rules.

CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
  expires INT(11) UNSIGNED NOT NULL,
  data MEDIUMTEXT COLLATE utf8mb4_bin,
  PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
