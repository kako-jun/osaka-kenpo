DROP TABLE IF EXISTS laws;
CREATE TABLE laws (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, name TEXT NOT NULL, display_name TEXT NOT NULL, short_name TEXT, badge TEXT, year INTEGER, source TEXT, description TEXT, links TEXT, UNIQUE(category, name));

DROP TABLE IF EXISTS articles;
CREATE TABLE articles (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, law_name TEXT NOT NULL, article TEXT NOT NULL, is_suppl INTEGER DEFAULT 0, is_deleted INTEGER DEFAULT 0, title TEXT DEFAULT '', title_osaka TEXT DEFAULT '', original_text TEXT DEFAULT '[]', osaka_text TEXT DEFAULT '[]', commentary TEXT DEFAULT '[]', commentary_osaka TEXT DEFAULT '[]', UNIQUE(category, law_name, article));

DROP TABLE IF EXISTS chapters;
CREATE TABLE chapters (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, law_name TEXT NOT NULL, chapter INTEGER NOT NULL, title TEXT NOT NULL, title_osaka TEXT, description TEXT, description_osaka TEXT, articles TEXT, UNIQUE(category, law_name, chapter));

DROP TABLE IF EXISTS famous_articles;
CREATE TABLE famous_articles (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, law_name TEXT NOT NULL, article TEXT NOT NULL, badge TEXT NOT NULL, UNIQUE(category, law_name, article));

CREATE INDEX IF NOT EXISTS idx_articles_law ON articles(category, law_name);
CREATE INDEX IF NOT EXISTS idx_chapters_law ON chapters(category, law_name);
CREATE INDEX IF NOT EXISTS idx_famous_articles_law ON famous_articles(category, law_name);

DROP TABLE IF EXISTS articles_fts;
CREATE VIRTUAL TABLE articles_fts USING fts5(category, law_name, article, title, title_osaka, original_text, osaka_text, commentary, commentary_osaka, content='articles', content_rowid='id');

DROP TRIGGER IF EXISTS articles_ai;
CREATE TRIGGER articles_ai AFTER INSERT ON articles BEGIN INSERT INTO articles_fts(rowid, category, law_name, article, title, title_osaka, original_text, osaka_text, commentary, commentary_osaka) VALUES (new.id, new.category, new.law_name, new.article, new.title, new.title_osaka, new.original_text, new.osaka_text, new.commentary, new.commentary_osaka); END;

DROP TRIGGER IF EXISTS articles_ad;
CREATE TRIGGER articles_ad AFTER DELETE ON articles BEGIN INSERT INTO articles_fts(articles_fts, rowid, category, law_name, article, title, title_osaka, original_text, osaka_text, commentary, commentary_osaka) VALUES ('delete', old.id, old.category, old.law_name, old.article, old.title, old.title_osaka, old.original_text, old.osaka_text, old.commentary, old.commentary_osaka); END;

DROP TRIGGER IF EXISTS articles_au;
CREATE TRIGGER articles_au AFTER UPDATE ON articles BEGIN INSERT INTO articles_fts(articles_fts, rowid, category, law_name, article, title, title_osaka, original_text, osaka_text, commentary, commentary_osaka) VALUES ('delete', old.id, old.category, old.law_name, old.article, old.title, old.title_osaka, old.original_text, old.osaka_text, old.commentary, old.commentary_osaka); INSERT INTO articles_fts(rowid, category, law_name, article, title, title_osaka, original_text, osaka_text, commentary, commentary_osaka) VALUES (new.id, new.category, new.law_name, new.article, new.title, new.title_osaka, new.original_text, new.osaka_text, new.commentary, new.commentary_osaka); END;
