/**
 * 条文データローダー（後方互換性のための再エクスポート）
 *
 * このファイルは既存のインポートパスを維持するためのエントリーポイントです。
 * 実装は article_loader/ ディレクトリに分割されています。
 */

export {
  loadArticle,
  loadAllArticles,
  loadArticleFromYaml,
  loadArticleFromJson,
  splitIntoParagraphs,
  sortArticles,
  getArticleValidationErrors,
} from './article-loader-core';
