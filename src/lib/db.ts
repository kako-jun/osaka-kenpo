import { getRequestContext } from '@cloudflare/next-on-pages';

export function getDB() {
  const { env } = getRequestContext();
  return env.DB;
}

// 法律一覧を取得
export async function getLaws() {
  const db = getDB();
  const result = await db
    .prepare(
      `SELECT category, name, display_name, short_name, badge, year
       FROM laws
       ORDER BY category, name`
    )
    .all();
  return result.results;
}

// 特定カテゴリの法律一覧を取得
export async function getLawsByCategory(category: string) {
  const db = getDB();
  const result = await db
    .prepare(
      `SELECT DISTINCT law_name as name
       FROM articles
       WHERE category = ?
       ORDER BY law_name`
    )
    .bind(category)
    .all();
  return result.results;
}

// 法律の条文一覧を取得
export async function getArticles(category: string, lawName: string) {
  const db = getDB();
  const result = await db
    .prepare(
      `SELECT article, title, title_osaka, is_deleted
       FROM articles
       WHERE category = ? AND law_name = ?
       ORDER BY
         CASE WHEN article GLOB '[0-9]*' THEN CAST(article AS INTEGER) ELSE 9999 END,
         article`
    )
    .bind(category, lawName)
    .all();
  return result.results;
}

// 特定の条文を取得
export async function getArticle(category: string, lawName: string, articleId: string) {
  const db = getDB();
  const result = await db
    .prepare(
      `SELECT * FROM articles
       WHERE category = ? AND law_name = ? AND article = ?`
    )
    .bind(category, lawName, articleId)
    .first();
  return result;
}

// 法律メタデータを取得
export async function getLawMetadata(category: string, lawName: string) {
  const db = getDB();
  const result = await db
    .prepare(
      `SELECT * FROM laws
       WHERE category = ? AND name = ?`
    )
    .bind(category, lawName)
    .first();
  return result;
}

// 章データを取得
export async function getChapters(category: string, lawName: string) {
  const db = getDB();
  const result = await db
    .prepare(
      `SELECT * FROM chapters
       WHERE category = ? AND law_name = ?
       ORDER BY chapter`
    )
    .bind(category, lawName)
    .all();
  return result.results;
}

// 有名条文バッジを取得
export async function getFamousArticles(category: string, lawName: string) {
  const db = getDB();
  const result = await db
    .prepare(
      `SELECT article, badge FROM famous_articles
       WHERE category = ? AND law_name = ?`
    )
    .bind(category, lawName)
    .all();

  // { article: badge } 形式に変換
  const badges: Record<string, string> = {};
  for (const row of result.results as any[]) {
    badges[row.article] = row.badge;
  }
  return badges;
}
