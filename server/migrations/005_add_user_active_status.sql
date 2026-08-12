-- 005_add_user_active_status.sql
-- Adds users.is_active, backing the admin user-management
-- deactivate/reactivate capability (server/src/routes/users.js).
--
-- Deactivating a user blocks new logins immediately (checked in
-- POST /auth/login) AND revokes an already-active session on its very
-- next request — requireAuth.js and requireAdmin.js both look this up
-- fresh per request (same reasoning as requireAdmin's existing role
-- lookup), rather than only taking effect once the 7-day session cookie
-- naturally expires.

ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
