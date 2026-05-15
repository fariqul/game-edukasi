CREATE TABLE IF NOT EXISTS student_scores (
  id SERIAL PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_id TEXT,
  mode TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  stars INTEGER NOT NULL DEFAULT 0,
  xp_total INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER,
  hints_used INTEGER,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_scores_student_name ON student_scores (student_name);
CREATE INDEX IF NOT EXISTS idx_student_scores_mode_level ON student_scores (mode, level);
CREATE INDEX IF NOT EXISTS idx_student_scores_created_at ON student_scores (created_at DESC);
