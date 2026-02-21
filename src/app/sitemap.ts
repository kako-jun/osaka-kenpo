import { MetadataRoute } from 'next';
import { lawsMetadata } from '@/data/lawsMetadata';
import { getDB } from '@/lib/db';
import { logger } from '@/lib/logger';

export const runtime = 'edge';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://osaka-kenpo.llll-ll.com';

  // 基本ページ
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  try {
    // lawsMetadata からカテゴリ・法律ページを生成
    for (const category of lawsMetadata.categories) {
      // カテゴリページ（表示用カテゴリはスキップ: パスを持たない）
      const firstLaw = category.laws[0];
      if (!firstLaw) continue;

      // 法律ページ
      for (const law of category.laws) {
        if (law.status !== 'available') continue;

        routes.push({
          url: `${baseUrl}${law.path}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.8,
        });

        // D1 から条文一覧を取得
        const parts = law.path.split('/');
        const categoryId = parts[2];
        const lawName = parts[3];
        if (!categoryId || !lawName) continue;

        try {
          const db = getDB();
          const result = await db
            .prepare(
              `SELECT article FROM articles WHERE category = ? AND law_name = ? ORDER BY article`
            )
            .bind(categoryId, lawName)
            .all<{ article: string }>();

          for (const row of result.results) {
            routes.push({
              url: `${baseUrl}/law/${categoryId}/${lawName}/${row.article}`,
              lastModified: new Date(),
              changeFrequency: 'monthly',
              priority: 0.6,
            });
          }
        } catch {
          // D1 アクセス失敗時は条文ページを省略（法律ページまでは出力する）
        }
      }
    }
  } catch (error) {
    logger.error('Error generating sitemap', error);
  }

  return routes;
}
