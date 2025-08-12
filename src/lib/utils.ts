// ユーティリティ関数

/**
 * 文字列の配列を数値でソートする
 */
export function sortArticleNumbers(articles: string[]): string[] {
  return articles.sort((a, b) => {
    const numA = parseInt(a)
    const numB = parseInt(b)
    
    // 数値として解釈できない場合は文字列ソート
    if (isNaN(numA) || isNaN(numB)) {
      return a.localeCompare(b)
    }
    
    return numA - numB
  })
}

/**
 * 条文番号を整形する（例: "1" -> "第1条"）
 */
export function formatArticleNumber(article: number | string): string {
  return `第${article}条`
}

/**
 * URL用のslugを生成する
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

/**
 * パンくずナビゲーション用のアイテムを生成
 */
export interface BreadcrumbItem {
  label: string
  href?: string
}

export function generateBreadcrumbs(
  lawCategory: string,
  law?: string,
  article?: string
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'トップ', href: '/' }
  ]

  if (lawCategory) {
    breadcrumbs.push({
      label: getLawCategoryName(lawCategory),
      href: `/law/${lawCategory}`
    })
  }

  if (law) {
    breadcrumbs.push({
      label: getLawName(law),
      href: `/law/${lawCategory}/${law}`
    })
  }

  if (article) {
    breadcrumbs.push({
      label: formatArticleNumber(article)
    })
  }

  return breadcrumbs
}

/**
 * 法律カテゴリ名を取得
 */
function getLawCategoryName(category: string): string {
  const categoryNames: { [key: string]: string } = {
    jp: '日本・現行法',
    jp_old: '日本・歴史法',
    foreign: '外国・現行法', 
    foreign_old: '外国・歴史法',
    treaty: '国際条約'
  }
  
  return categoryNames[category] || category
}

/**
 * 法律名を取得（law_mappings.tsから）
 */
function getLawName(slug: string): string {
  // 循環依存を避けるため、ここでは簡易実装
  // 実際の使用時はlaw_mappings.tsから import する
  return slug
}

/**
 * 安全なJSONパース
 */
export function safeJsonParse<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    console.error('JSON parse error:', error)
    return null
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
  )
}

/**
 * エラーメッセージの標準化
 */
export function createErrorResponse(message: string, status: number = 400) {
  return {
    error: message,
    status,
    timestamp: new Date().toISOString()
  }
}

/**
 * 成功レスポンスの標準化
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    data,
    message,
    timestamp: new Date().toISOString()
  }
}