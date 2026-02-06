import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { LawsMetadataSchema } from '@/lib/schemas/laws_metadata';
import { logger } from '@/lib/logger';

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
    // 全法律メタデータを直接読み込み
    const dataDir = path.join(process.cwd(), 'src/data');
    const metadataPath = path.join(dataDir, 'laws_metadata.yaml');

    if (fs.existsSync(metadataPath)) {
      const yamlContent = fs.readFileSync(metadataPath, 'utf-8');
      const data = yaml.load(yamlContent);
      const lawsMetadata = LawsMetadataSchema.parse(data);

      // カテゴリページ
      for (const category of lawsMetadata.categories) {
        routes.push({
          url: `${baseUrl}/law/${category.id}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.9,
        });

        // 法律ページと条文ページ
        for (const law of category.laws) {
          // 法律ページ
          routes.push({
            url: `${baseUrl}/law/${category.id}/${law.id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
          });

          // 条文ページは動的に生成されるため、ここではスキップ
          // 実際の条文データを読み込む必要があるが、簡素化のため基本ページのみ含める
        }
      }
    }
  } catch (error) {
    logger.error('Error generating sitemap', error);
  }

  return routes;
}
