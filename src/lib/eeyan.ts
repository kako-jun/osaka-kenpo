// ええやんユーティリティ

export { getOrCreateEeyanUserId, getEeyanUserId, setEeyanUserId } from '@/lib/storage';

/** nostalgic API ベースURL (Like) */
export const NOSTALGIC_API_BASE = 'https://api.nostalgic.llll-ll.com/like';

/** nostalgic Counter API ベースURL (Visit) */
export const NOSTALGIC_COUNTER_API_BASE = 'https://api.nostalgic.llll-ll.com/visit';

/** nostalgic batchGet の1回あたり上限（101件以上で500エラー） */
export const NOSTALGIC_BATCH_LIMIT = 100;

/** nostalgic用のIDを生成 */
export function getNostalgicId(category: string, lawName: string, article: string): string {
  return `osaka-kenpo-${category}-${lawName}-${article}`;
}
