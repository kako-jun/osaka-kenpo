import { z } from 'zod';
import { safeValidateArticleData } from '../schemas/article';

/**
 * 条文データの検証結果を取得（エラーハンドリング用）
 * @param data 検証対象のデータ
 * @returns 検証エラーメッセージの配列
 */
export function getArticleValidationErrors(data: unknown): string[] {
  const result = safeValidateArticleData(data);
  if (result.success) {
    return [];
  }

  return result.error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`);
}
