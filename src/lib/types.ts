// 共通型定義

// ArticleDataはZodスキーマから自動生成される型を使用
export type { ArticleData } from './schemas/article'

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