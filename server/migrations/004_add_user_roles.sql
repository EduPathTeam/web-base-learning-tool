-- 004_add_user_roles.sql
-- Adds role-based authorization for the admin feedback view
-- (server/src/routes/feedback.js's GET /, gated by requireAdmin.js).
-- Every existing/new user defaults to 'student'; promoting someone to
-- 'admin' is a manual step for now (see README.md's "Admin access"
-- section) — this doesn't add self-service admin promotion.

ALTER TABLE users
  ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'student' AFTER display_name,
  ADD CONSTRAINT chk_users_role CHECK (role IN ('student', 'admin'));
