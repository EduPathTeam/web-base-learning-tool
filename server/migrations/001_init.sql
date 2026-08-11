-- 001_init.sql
-- Initial schema for the CS Learning Platform.
-- Follows CLAUDE.md's Database Rules: snake_case names, every table has an
-- `id` primary key and created_at/updated_at timestamps, explicit foreign
-- keys named `<table_singular>_id`, indexes on foreign keys.
--
-- This migration is additive-only and has not been run against a shared
-- database yet, so it's safe to edit directly. Once applied anywhere else,
-- future changes must go in a new numbered migration file instead.

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One row per topic (arrays, linked-lists, queues, ... big-o) — mirrors
-- src/lib/csPlatform.js's TOPICS constant so the frontend and DB agree on
-- topic ids without duplicating the list of lesson URLs server-side.
CREATE TABLE IF NOT EXISTS topics (
  id VARCHAR(40) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  total_lessons INT NOT NULL DEFAULT 10,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lesson_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  topic_id VARCHAR(40) NOT NULL,
  completed_count INT NOT NULL DEFAULT 0,
  last_lesson_url VARCHAR(255) NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_topic (user_id, topic_id),
  CONSTRAINT fk_lesson_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_lesson_progress_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_topic_id ON lesson_progress(topic_id);

CREATE TABLE IF NOT EXISTS quiz_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  topic_id VARCHAR(40) NOT NULL,
  score INT NOT NULL,
  taken_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quiz_results_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_quiz_results_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  CONSTRAINT chk_quiz_results_score CHECK (score BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_topic_id ON quiz_results(topic_id);

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  category VARCHAR(60) NOT NULL DEFAULT 'General Feedback',
  rating TINYINT NOT NULL DEFAULT 0,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 0 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

-- Seed the fixed topic list (id/name/total_lessons only — everything else
-- about a topic, like lesson URLs, is owned by the frontend).
INSERT INTO topics (id, name, total_lessons) VALUES
  ('arrays', 'Arrays', 10),
  ('linked-lists', 'Linked Lists', 10),
  ('queues', 'Queue', 10),
  ('stacks', 'Stack', 10),
  ('trees', 'Trees', 10),
  ('graphs', 'Graphs', 10),
  ('recursion', 'Recursion', 10),
  ('dynamic-programming', 'Dynamic Programming', 10),
  ('sorting', 'Sorting', 10),
  ('searching', 'Searching', 10),
  ('greedy', 'Greedy Algorithm', 10),
  ('big-o', 'Big-O Notation', 10)
ON DUPLICATE KEY UPDATE name = VALUES(name), total_lessons = VALUES(total_lessons);
