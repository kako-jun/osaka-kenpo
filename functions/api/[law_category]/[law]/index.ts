// GET /api/[law_category]/[law] - 法律内の条文一覧

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { law_category, law } = context.params as { law_category: string; law: string };

  if (!law_category || !law) {
    return Response.json({ error: 'Missing law category or law' }, { status: 400 });
  }

  try {
    const { results } = await context.env.DB.prepare(
      `SELECT article, title, title_osaka
       FROM articles
       WHERE category = ? AND law_name = ?
       ORDER BY
         CASE
           WHEN article GLOB '[0-9]*' THEN CAST(article AS INTEGER)
           ELSE 999999
         END,
         article`
    ).bind(law_category, law).all();

    return Response.json({
      data: results.map((article: any) => ({
        id: article.article,
        article: article.article,
        title: article.title || '',
        titleOsaka: article.title_osaka || article.title || '',
      })),
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return Response.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
};
