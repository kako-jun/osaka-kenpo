// 共通型定義

export interface ArticleData {
  article: number
  title: string
  titleWithRuby?: string  // ルビ付きタイトル（オプション）
  titleOsaka?: string  // 大阪弁版タイトル（オプション）
  original: string
  originalWithRuby?: string  // ルビ付き原文（オプション）
  osaka: string
  commentary: string  // 標準語版解説
  commentaryOsaka?: string  // 大阪弁版解説（オプション、後方互換性のため）
}

export interface LawInfo {
  slug: string
  name: string
  year?: number | null
}

export interface ArticleListItem {
  article: string
  title: string
  titleOsaka?: string
}

export interface LawCategory {
  slug: string
  name: string
  description: string
}

// 法律カテゴリの定義
export const LAW_CATEGORIES = {
  jp: '日本・現行法',
  jp_old: '日本・歴史法', 
  foreign: '外国・現行法',
  foreign_old: '外国・歴史法',
  treaty: '国際条約'
} as const

export type LawCategoryKey = keyof typeof LAW_CATEGORIES

// View Mode の型
export type ViewMode = 'original' | 'osaka'