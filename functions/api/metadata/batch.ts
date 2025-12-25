// GET /api/metadata/batch - 全法律メタデータバッチ

/// <reference path="../../env.d.ts" />

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const parseJSON = (str: string | null) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  try {
    const { results } = await context.env.DB.prepare(
      `SELECT category, name, display_name, short_name, badge, year, source, description, links
       FROM laws
       ORDER BY category, name`
    ).all();

    // カテゴリごとにグループ化
    const lawsMetadata: Record<string, any[]> = {};
    const lawMetadata: Record<string, any> = {};

    for (const law of results) {
      const category = law.category as string;
      const name = law.name as string;

      if (!lawsMetadata[category]) {
        lawsMetadata[category] = [];
      }
      lawsMetadata[category].push({
        id: name,
        name: law.display_name,
        shortName: law.short_name,
        badge: law.badge,
        year: law.year,
        description: law.description,
      });

      // 個別法律メタデータ
      const key = `${category}/${name}`;
      lawMetadata[key] = {
        name: law.display_name,
        shortName: law.short_name,
        badge: law.badge,
        year: law.year,
        source: law.source,
        description: law.description,
        links: parseJSON(law.links as string),
      };
    }

    return Response.json({
      lawsMetadata,
      lawMetadata,
    });
  } catch (error) {
    console.error('Error fetching batch metadata:', error);
    return Response.json({ error: 'Failed to fetch batch metadata' }, { status: 500 });
  }
};
