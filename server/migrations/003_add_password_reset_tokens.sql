-- 003_add_password_reset_tokens.sql
-- Adds the table backing the password reset flow (server/src/routes/auth.js).
-- Follows the same conventions as 001_init.sql: snake_case names, explicit
-- foreign key, indexes on columns used in WHERE/JOIN.
--
-- Only a hash of the reset token is ever stored (token_hash) — the raw
-- token exists only in the link sent to the user (currently logged to the
-- server console as a dev-only stand-in for real email delivery; see
-- README.md). expires_at + used_at let the reset route reject expired or
-- already-used tokens without needing a separate cleanup job.

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE UNIQUE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
