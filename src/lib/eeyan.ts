// ええやんユーティリティ

export { getOrCreateEeyanUserId, getEeyanUserId, setEeyanUserId } from '@/lib/storage';

/** nostalgic API ベースURL */
export const NOSTALGIC_API_BASE = 'https://api.nostalgic.llll-ll.com/like';

/** nostalgic用のIDを生成 */
export function getNostalgicId(category: string, lawName: string, article: string): string {
  return `osaka-kenpo-${category}-${lawName}-${article}`;
}
