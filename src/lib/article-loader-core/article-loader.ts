import fs from 'fs/promises';
import path from 'path';
import type { ArticleData } from '../schemas/article';
import { logger } from '../logger';
import { DataLoadError } from '../errors';
import { loadArticleFromYaml, loadArticleFromJson } from './file-readers';
import { sortArticles } from './article-sorter';

/**
 * 条文データを自動で読み込む（YAML優先、JSONフォールバック）
 * @param lawCategory 法律カテゴリ
 * @param lawName 法律名
 * @param articleNumber 条文番号
 * @returns 検証済み条文データ
 */
export async function loadArticle(
  lawCategory: string,
  lawName: string,
  articleNumber: string | number
): Promise<ArticleData> {
  const basePath = path.join(process.cwd(), 'src', 'data', 'laws', lawCategory, lawName);
  const articleId = articleNumber.toString();

  // YAML形式を優先的に試す
  const yamlPath = path.join(basePath, `${articleId}.yaml`);
  try {
    await fs.access(yamlPath);
    return await loadArticleFromYaml(yamlPath);
  } catch {
    // YAML が見つからない場合、JSONを試す
    const jsonPath = path.join(basePath, `${articleId}.json`);
    try {
      return await loadArticleFromJson(jsonPath);
    } catch {
      throw new DataLoadError(
        `条文データが見つかりません: ${lawCategory}/${lawName}/${articleId}`,
        {
          lawCategory,
          lawName,
          articleId,
        }
      );
    }
  }
}

/**
 * 法律の全条文を読み込む
 * @param lawCategory 法律カテゴリ
 * @param lawName 法律名
 * @returns 検証済み条文データの配列
 */
export async function loadAllArticles(
  lawCategory: string,
  lawName: string
): Promise<ArticleData[]> {
  const basePath = path.join(process.cwd(), 'src', 'data', 'laws', lawCategory, lawName);

  try {
    const files = await fs.readdir(basePath);
    const articleFiles = files.filter(
      (file) =>
        (file.endsWith('.yaml') || file.endsWith('.json')) &&
        !file.includes('metadata') &&
        !file.includes('famous_articles') &&
        !file.includes('chapters')
    );

    const articles: ArticleData[] = [];

    for (const file of articleFiles) {
      const articleId = file.replace(/\.(yaml|json)$/, '');
      try {
        const article = await loadArticle(lawCategory, lawName, articleId);
        articles.push(article);
      } catch (error) {
        logger.warn(`Skipping invalid article: ${file}`, { file, lawCategory, lawName, error });
      }
    }

    // 条文番号でソート
    return sortArticles(articles);
  } catch (error) {
    logger.error(`Failed to load articles from ${lawCategory}/${lawName}`, error, {
      lawCategory,
      lawName,
    });
    throw new DataLoadError(`条文一覧の読み込みに失敗しました: ${lawCategory}/${lawName}`, {
      lawCategory,
      lawName,
    });
  }
}
