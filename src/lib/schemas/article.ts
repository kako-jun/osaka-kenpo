import { z } from 'zod'

/**
 * 条文データのZodスキーマ定義
 * 
 * 統一されたデータ構造：
 * - "original" → "originalText" (明確化)
 * - "osaka" → "osakaText" (対応関係を明確化) 
 * - 全テキストフィールドを配列形式に統一（段落単位での構造化）
 * - 不要フィールドの削除: year, chapter, chapterTitle, chapterTitleOsaka
 */
export const ArticleSchema = z.object({
  /** 条文番号 */
  article: z.union([z.number().int().positive(), z.string().min(1)]),
  
  /** 条文タイトル（空文字列も許可） */
  title: z.string(),
  
  /** 条文タイトル（大阪弁版、オプション） */
  titleOsaka: z.string().optional(),
  
  /** 原文（段落の配列） */
  originalText: z.array(z.string().min(1)).min(1, '原文は必須です'),
  
  /** 大阪弁翻訳（段落の配列） */
  osakaText: z.array(z.string().min(1)).min(1, '大阪弁翻訳は必須です'),
  
  /** 解説文（段落の配列） */
  commentary: z.array(z.string().min(1)).min(1, '解説は必須です'),
  
  /** 解説文（大阪弁版、段落の配列、オプション） */
  commentaryOsaka: z.array(z.string().min(1)).optional()
})

export type ArticleData = z.infer<typeof ArticleSchema>

/**
 * 条文データを検証する
 * @param data 検証対象のデータ
 * @returns 検証結果
 */
export function validateArticleData(data: unknown): ArticleData {
  return ArticleSchema.parse(data)
}

/**
 * 条文データを安全に検証する（エラーを返す）
 * @param data 検証対象のデータ
 * @returns 検証結果またはエラー
 */
export function safeValidateArticleData(data: unknown) {
  return ArticleSchema.safeParse(data)
}