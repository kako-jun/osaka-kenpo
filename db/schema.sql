-- osaka-kenpo D1 Schema
-- 毎回フルリビルドするため、DROP TABLE IF EXISTS を使用

-- 法律メタデータ
DROP TABLE IF EXISTS laws;
CREATE TABLE laws (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,           -- 'jp', 'foreign', 'historical', 'treaty'
  name TEXT NOT NULL,               -- 'constitution', 'minpou', etc.
  display_name TEXT NOT NULL,       -- '日本国憲法'
  short_name TEXT,                  -- 短縮名
  badge TEXT,                       -- バッジテキスト
  year INTEGER,
  source TEXT,
  description TEXT,
  links TEXT,                       -- JSON配列
  UNIQUE(category, name)
);

-- 条文データ
DROP TABLE IF EXISTS articles;
CREATE TABLE articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  law_name TEXT NOT NULL,
  article TEXT NOT NULL,            -- '1', '132-2', 'fusoku_1' など
  is_suppl INTEGER DEFAULT 0,       -- 附則フラグ
  is_deleted INTEGER DEFAULT 0,     -- 削除済みフラグ
  title TEXT,
  title_osaka TEXT,
  original_text TEXT,               -- JSON配列
  osaka_text TEXT,                  -- JSON配列
  commentary TEXT,                  -- JSON配列
  commentary_osaka TEXT,            -- JSON配列
  UNIQUE(category, law_name, article)
);

-- 章データ
DROP TABLE IF EXISTS chapters;
CREATE TABLE chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  law_name TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_osaka TEXT,
  description TEXT,
  description_osaka TEXT,
  articles TEXT,                    -- JSON配列
  UNIQUE(category, law_name, chapter)
);

-- 有名条文バッジ
DROP TABLE IF EXISTS famous_articles;
CREATE TABLE famous_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  law_name TEXT NOT NULL,
  article TEXT NOT NULL,
  badge TEXT NOT NULL,
  UNIQUE(category, law_name, article)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_articles_law ON articles(category, law_name);
CREATE INDEX IF NOT EXISTS idx_chapters_law ON chapters(category, law_name);
CREATE INDEX IF NOT EXISTS idx_famous_articles_law ON famous_articles(category, law_name);

-- 全文検索用テーブル（将来の検索機能用）
DROP TABLE IF EXISTS articles_fts;
CREATE VIRTUAL TABLE articles_fts USING fts5(
  category,
  law_name,
  article,
  title,
  title_osaka,
  original_text,
  osaka_text,
  commentary,
  commentary_osaka,
  content='articles',
  content_rowid='id'
);

-- FTSトリガー（articlesテーブル更新時に自動同期）
DROP TRIGGER IF EXISTS articles_ai;
CREATE TRIGGER articles_ai AFTER INSERT ON articles BEGIN
  INSERT INTO articles_fts(rowid, category, law_name, article, title, title_osaka, original_text, osaka_text, commentary, commentary_osaka)
  VALUES (new.id, new.category, new.law_name, new.article, new.title, new.title_osaka, new.original_text, new.osaka_text, new.commentary, new.commentary_osaka);
END;

DROP TRIGGER IF EXISTS articles_ad;
CREATE TRIGGER articles_ad AFTER DELETE ON articles BEGIN
  INSERT INTO articles_fts(articles_fts, rowid, category, law_name, article, title, title_osaka, original_text, osaka_text, commentary, commentary_osaka)
  VALUES ('delete', old.id, old.category, old.law_name, old.article, old.title, old.title_osaka, old.original_text, old.osaka_text, old.commentary, old.commentary_osaka);
END;

DROP TRIGGER IF EXISTS articles_au;
CREATE TRIGGER articles_au AFTER UPDATE ON articles BEGIN
  INSERT INTO articles_fts(articles_fts, rowid, category, law_name, article, title, title_osaka, original_text, osaka_text, commentary, commentary_osaka)
  VALUES ('delete', old.id, old.category, old.law_name, old.article, old.title, old.title_osaka, old.original_text, old.osaka_text, old.commentary, old.commentary_osaka);
  INSERT INTO articles_fts(rowid, category, law_name, article, title, title_osaka, original_text, osaka_text, commentary, commentary_osaka)
  VALUES (new.id, new.category, new.law_name, new.article, new.title, new.title_osaka, new.original_text, new.osaka_text, new.commentary, new.commentary_osaka);
END;

-- 個人ええやん（学習ブックマーク）
DROP TABLE IF EXISTS user_likes;
CREATE TABLE user_likes (
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  law_name TEXT NOT NULL,
  article TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, category, law_name, article)
);

CREATE INDEX idx_user_likes_user ON user_likes(user_id);
CREATE INDEX idx_user_likes_law ON user_likes(user_id, category, law_name);
