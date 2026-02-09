// ええやんユーティリティ

/** nostalgic API ベースURL */
export const NOSTALGIC_API_BASE = 'https://api.nostalgic.llll-ll.com/api/like';

/** localStorage のキー */
const USER_ID_KEY = 'eeyan_user_id';

/** UUID v4 を生成 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/** ユーザーIDを取得（なければ生成して保存） */
export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return '';
  const existing = localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;
  const id = generateUUID();
  localStorage.setItem(USER_ID_KEY, id);
  return id;
}

/** ユーザーIDを取得（未生成なら空文字） */
export function getUserId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(USER_ID_KEY) || '';
}

/** ユーザーIDを設定（端末間同期用） */
export function setUserId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_ID_KEY, id);
}

/** nostalgic用のIDを生成 */
export function getNostalgicId(category: string, lawName: string, article: string): string {
  return `osaka-kenpo-${category}-${lawName}-${article}`;
}
