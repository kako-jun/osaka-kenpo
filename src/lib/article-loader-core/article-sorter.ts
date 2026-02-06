import type { ArticleData } from '../schemas/article';

/**
 * 条文配列を条文番号でソートする（数値とそれ以外を適切に処理）
 * @param articles 条文データの配列
 * @returns ソート済みの条文配列
 */
export function sortArticles(articles: ArticleData[]): ArticleData[] {
  return articles.sort((a, b) => {
    const aNum =
      typeof a.article === 'number'
        ? a.article
        : parseInt(String(a.article)) || Number.MAX_SAFE_INTEGER;
    const bNum =
      typeof b.article === 'number'
        ? b.article
        : parseInt(String(b.article)) || Number.MAX_SAFE_INTEGER;

    if (aNum !== Number.MAX_SAFE_INTEGER && bNum !== Number.MAX_SAFE_INTEGER) {
      return aNum - bNum;
    }

    if (aNum !== Number.MAX_SAFE_INTEGER) return -1;
    if (bNum !== Number.MAX_SAFE_INTEGER) return 1;

    // 両方とも非数値の場合は文字列でソート（附則を最後に）
    return String(a.article).localeCompare(String(b.article));
  });
}
