// ユーティリティ関数

/**
 * 文字列の配列を数値でソートする
 */
export function sortArticleNumbers(articles: string[]): string[] {
  return articles.sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);

    // 数値として解釈できない場合は文字列ソート
    if (isNaN(numA) || isNaN(numB)) {
      return a.localeCompare(b);
    }

    return numA - numB;
  });
}

/**
 * 条文番号を整形する（例: "1" -> "第1条", "fusoku_1" -> "附則第1条"）
 */
export function formatArticleNumber(article: number | string): string {
  if (typeof article === 'number') return `第${article}条`;
  if (String(article).startsWith('fusoku_')) {
    return `附則第${String(article).replace('fusoku_', '')}条`;
  }
  return `第${article}条`;
}

/**
 * URL用のslugを生成する
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * 安全なJSONパース
 */
export function safeJsonParse<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
}

/**
 * 条文データのバリデーション
 */
export function validateArticleData(data: any): boolean {
  return (
    data &&
    typeof data.article === 'number' &&
    typeof data.title === 'string' &&
    typeof data.original === 'string' &&
    typeof data.osaka === 'string' &&
    typeof data.commentary === 'string'
  );
}

/**
 * エラーメッセージの標準化
 */
export function createErrorResponse(message: string, status: number = 400) {
  return {
    error: message,
    status,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 成功レスポンスの標準化
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}
