// GET /api/metadata/laws_metadata - 全法律メタデータ

/// <reference path="../../env.d.ts" />

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT category, name, display_name, short_name, badge, year, description
       FROM laws
       ORDER BY category, name`
    ).all();

    // カテゴリごとにグループ化
    const grouped: Record<string, any[]> = {};

    for (const law of results) {
      const category = law.category as string;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        id: law.name,
        name: law.display_name,
        shortName: law.short_name,
        badge: law.badge,
        year: law.year,
        description: law.description,
      });
    }

    return Response.json(grouped);
  } catch (error) {
    console.error('Error fetching laws metadata:', error);
    return Response.json({ error: 'Failed to fetch laws metadata' }, { status: 500 });
  }
};
