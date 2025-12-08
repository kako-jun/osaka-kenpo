// GET /api/[law_category] - カテゴリ内の法律一覧

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { law_category } = context.params as { law_category: string };

  if (!law_category) {
    return Response.json({ error: 'Missing law category' }, { status: 400 });
  }

  try {
    const { results } = await context.env.DB.prepare(
      `SELECT name, display_name, short_name, badge, year, description
       FROM laws
       WHERE category = ?
       ORDER BY name`
    ).bind(law_category).all();

    return Response.json({
      data: results.map((law: any) => ({
        id: law.name,
        name: law.display_name,
        shortName: law.short_name,
        badge: law.badge,
        year: law.year,
        description: law.description,
      })),
    });
  } catch (error) {
    console.error('Error fetching laws:', error);
    return Response.json({ error: 'Failed to fetch laws' }, { status: 500 });
  }
};
