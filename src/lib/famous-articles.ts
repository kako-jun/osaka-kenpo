/**
 * 法律の有名条文バッジデータを動的に取得するユーティリティ
 */

export type FamousArticlesData = Record<string, string>

/**
 * 指定された法律の有名条文データを取得する
 * @param lawCategory - 法律カテゴリ（例: 'current_japan', 'foreign_old'）
 * @param lawName - 法律名（例: 'constitution', 'magna_carta'）
 * @returns 有名条文データまたはnull（ファイルが存在しない場合）
 */
export async function getFamousArticles(
  lawCategory: string, 
  lawName: string
): Promise<FamousArticlesData | null> {
  try {
    // 動的にfamous-articles.jsonファイルをインポート
    const famousArticles = await import(`@/data/laws/${lawCategory}/${lawName}/famous-articles.json`)
    return famousArticles.default as FamousArticlesData
  } catch (error) {
    // ファイルが存在しない場合はnullを返す
    return null
  }
}

/**
 * 特定の条文が有名条文かどうかをチェック
 * @param famousArticles - 有名条文データ
 * @param articleNumber - 条文番号
 * @returns バッジテキストまたはundefined
 */
export function getFamousArticleData(
  famousArticles: FamousArticlesData | null,
  articleNumber: number | string
): string | undefined {
  if (!famousArticles) return undefined
  return famousArticles[articleNumber.toString()]
}