CREATE TABLE task_session (
  -- 自動増分の主キー
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- 関連するタスクID、NULL不可
  task_id INTEGER NOT NULL,
  -- 休憩かどうか、0=false 1=true
  is_break INTEGER NOT NULL DEFAULT 0,
  -- セッション時間（秒）、NULL不可
  duration INTEGER NOT NULL,
  -- 完了日時、デフォルトは現在時刻
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(task_id) REFERENCES task(id)
);
