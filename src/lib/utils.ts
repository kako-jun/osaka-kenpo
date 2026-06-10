// ユーティリティ関数

import { logger } from './logger';

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
 * 条文番号を整形する（例: "1" -> "第1条", "suppl-1" -> "附則第1条"）
 * 正規形式のみ受け付ける（suppl-N, amend-N）。旧形式（fusoku_, amendment_, アンダースコア）は不正データ
 */
export function formatArticleNumber(article: number | string): string {
  if (typeof article === 'number') return `第${article}条`;
  const s = String(article);
  const supplMatch = s.match(/^suppl-(.+)$/);
  if (supplMatch) return `附則第${supplMatch[1]}条`;
  const amendMatch = s.match(/^amend-(.+)$/);
  if (amendMatch) return `修正第${amendMatch[1]}条`;
  const branchMatch = s.match(/^(\d+)-(\d+)$/);
  if (branchMatch) return `第${branchMatch[1]}条の${branchMatch[2]}`;
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
    logger.error('JSON parse error', error, { jsonString: jsonString.substring(0, 100) });
    return null;
  }
}

/**
 * 条文データのバリデーション（レガシー関数）
 * 注: 現在はZodスキーマ（src/lib/schemas/article.ts）を使用することを推奨
 */
export function validateArticleData(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;

  const article = data as Record<string, unknown>;
  return (
    typeof article.article === 'number' &&
    typeof article.title === 'string' &&
    typeof article.original === 'string' &&
    typeof article.osaka === 'string' &&
    typeof article.commentary === 'string'
  );
}

/**
 * HTMLタグを除去する
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * テキストの冒頭を取得（指定文字数で省略）
 */
export function getExcerpt(text: string, maxLength: number = 50): string {
  if (!text) return '';
  const cleaned = stripHtml(text).replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength) + '...';
}

/**
 * JSON配列文字列の先頭断片（substr で切れている可能性あり）から
 * 最初の要素（先頭段落）の文字列を復元する。切断されていても壊れない。
 * 後処理（whitespace正規化・trim・切り詰め）は呼び出し側に委ねる。
 */
export function extractFirstParagraphFromHead(head: string | null | undefined): string {
  if (!head) return '';
  // 先頭の `[`・空白・開き `"` を剥がして第一要素の本文開始位置へ
  const m = /^\s*\[\s*"/.exec(head);
  if (!m) return '';
  let i = m[0].length;
  let out = '';
  while (i < head.length) {
    const ch = head[i];
    if (ch === '"') break; // 未エスケープの閉じ引用 = 第一要素の終端
    if (ch === '\\') {
      const next = head[i + 1];
      if (next === undefined) break; // 断片末尾でエスケープが切れている
      switch (next) {
        case 'n':
          out += '\n';
          break;
        case 't':
          out += '\t';
          break;
        case 'r':
          out += '\r';
          break;
        case 'b':
          out += '\b';
          break;
        case 'f':
          out += '\f';
          break;
        case '"':
          out += '"';
          break;
        case '\\':
          out += '\\';
          break;
        case '/':
          out += '/';
          break;
        case 'u': {
          const hex = head.slice(i + 2, i + 6);
          if (/^[0-9a-fA-F]{4}$/.test(hex)) {
            out += String.fromCharCode(parseInt(hex, 16));
            i += 6;
            continue;
          }
          out += next; // 不完全な \u はそのまま
          break;
        }
        default:
          out += next;
          break;
      }
      i += 2;
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

/** ナビ用: 原文headから見出し無し条文のフォールバック抜粋（先頭段落をHTML除去・空白正規化してN字に切る） */
export function navExcerptFromHead(head: string | null | undefined, maxLength = 12): string {
  const parsed = extractFirstParagraphFromHead(head);
  if (!parsed) return '';
  // 一覧(getExcerpt)・eeyan と同様に HTML を除去して3面の抜粋整形を揃える
  const firstLine = stripHtml(parsed).replace(/\s+/g, ' ').trim();
  return firstLine.length > maxLength ? firstLine.slice(0, maxLength) + '...' : firstLine;
}

/**
 * 条文番号のソートキーを返す（枝番・附則・改正対応）
 */
export function getArticleSortKey(article: string): number {
  const supplMatch = article.match(/^suppl-(.+)$/);
  if (supplMatch) return 100000 + (parseInt(supplMatch[1], 10) || 0);
  const amendMatch = article.match(/^amend-(.+)$/);
  if (amendMatch) return 200000 + (parseInt(amendMatch[1], 10) || 0);
  const match = article.match(/^(\d+)-(\d+)$/);
  if (match) return parseInt(match[1], 10) + parseInt(match[2], 10) * 0.001;
  const num = parseInt(article, 10);
  return isNaN(num) ? 999999 : num;
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
