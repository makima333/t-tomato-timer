CREATE TABLE task (
  -- 自動増分の主キー
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- 名前、NULL不可
  name TEXT NOT NULL,
  -- 作業時間、NULL不可
  work_time INTEGER NOT NULL DEFAULT 25,
  -- 休憩時間、NULL不可
  break_time INTEGER NOT NULL DEFAULT 5,
  -- 作業回数、NULL不可
  auto_start INTEGER NOT NULL DEFAULT 0,
  -- 作成日時、デフォルトは現在時刻
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- 更新日時、デフォルトは現在時刻
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  -- 論理削除フラグ、デフォルトは0（削除されていない）
  deleted INTEGER DEFAULT 0
);