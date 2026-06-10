import { cache } from 'react';
import { getRequestContext } from '@cloudflare/next-on-pages';

// Type definitions for D1 database results
export interface LawRow {
  category: string;
  name: string;
  display_name: string;
  short_name: string;
  badge: string | null;
  year: number | null;
  source?: string;
  description?: string;
}

export interface ArticleRow {
  article: string;
  title: string | null;
  title_osaka: string | null;
  is_deleted: number;
  category?: string;
  law_name?: string;
  original_text?: string | null;
  osaka_text?: string | null;
  commentary?: string | null;
  commentary_osaka?: string | null;
}

export interface ArticleNavRow {
  article: string;
  title: string | null;
  title_osaka: string | null;
  is_deleted: number;
  original_text_head: string | null;
}

export interface ChapterRow {
  chapter: string;
  title: string;
  title_osaka: string | null;
  articles: string;
  category: string;
  law_name: string;
  description?: string;
}

export interface FamousArticleRow {
  article: string;
  badge: string;
}

export function getDB() {
  const { env } = getRequestContext();
  return env.DB;
}

// ナビ/一覧用の軽量取得（原文はフルではなく先頭100文字だけ）
export const getArticleNavList = cache(
  async (category: string, lawName: string): Promise<ArticleNavRow[]> => {
    const db = getDB();
    const result = await db
      .prepare(
        `SELECT article, title, title_osaka, is_deleted,
              substr(original_text, 1, 100) AS original_text_head
       FROM articles
       WHERE category = ? AND law_name = ?
       ORDER BY
         CASE WHEN article GLOB '[0-9]*' THEN CAST(article AS INTEGER) ELSE 9999 END,
         article`
      )
      .bind(category, lawName)
      .all<ArticleNavRow>();
    return result.results;
  }
);

// 特定の条文を取得
export const getArticle = cache(
  async (category: string, lawName: string, articleId: string): Promise<ArticleRow | null> => {
    const db = getDB();
    const result = await db
      .prepare(
        `SELECT * FROM articles
       WHERE category = ? AND law_name = ? AND article = ?`
      )
      .bind(category, lawName, articleId)
      .first<ArticleRow>();
    return result;
  }
);

// 法律メタデータを取得
export const getLawMetadata = cache(
  async (category: string, lawName: string): Promise<LawRow | null> => {
    const db = getDB();
    const result = await db
      .prepare(
        `SELECT * FROM laws
       WHERE category = ? AND name = ?`
      )
      .bind(category, lawName)
      .first<LawRow>();
    return result;
  }
);

// 章データを取得
export const getChapters = cache(
  async (category: string, lawName: string): Promise<ChapterRow[]> => {
    const db = getDB();
    const result = await db
      .prepare(
        `SELECT * FROM chapters
       WHERE category = ? AND law_name = ?
       ORDER BY chapter`
      )
      .bind(category, lawName)
      .all<ChapterRow>();
    return result.results;
  }
);

// 有名条文バッジを取得
export const getFamousArticles = cache(
  async (category: string, lawName: string): Promise<Record<string, string>> => {
    const db = getDB();
    const result = await db
      .prepare(
        `SELECT article, badge FROM famous_articles
       WHERE category = ? AND law_name = ?`
      )
      .bind(category, lawName)
      .all<FamousArticleRow>();

    // { article: badge } 形式に変換
    const badges: Record<string, string> = {};
    for (const row of result.results) {
      badges[row.article] = row.badge;
    }
    return badges;
  }
);
