// GET /api/[law_category]/[law]/[article] - 個別条文

/// <reference path="../../../env.d.ts" />

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { law_category, law, article } = context.params as {
    law_category: string;
    law: string;
    article: string;
  };

  if (!law_category || !law || !article) {
    return Response.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const result = await context.env.DB.prepare(
      `SELECT article, is_suppl, is_deleted, title, title_osaka,
              original_text, osaka_text, commentary, commentary_osaka
       FROM articles
       WHERE category = ? AND law_name = ? AND article = ?`
    )
      .bind(law_category, law, article)
      .first();

    if (!result) {
      return Response.json({ error: `Article ${article} not found` }, { status: 404 });
    }

    // JSON文字列をパース
    const parseJSON = (str: string | null) => {
      if (!str) return [];
      try {
        return JSON.parse(str);
      } catch {
        return [];
      }
    };

    return Response.json({
      data: {
        article: result.article,
        isSuppl: result.is_suppl === 1,
        isDeleted: result.is_deleted === 1,
        title: result.title || '',
        titleOsaka: result.title_osaka || '',
        originalText: parseJSON(result.original_text as string),
        osakaText: parseJSON(result.osaka_text as string),
        commentary: parseJSON(result.commentary as string),
        commentaryOsaka: parseJSON(result.commentary_osaka as string),
      },
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return Response.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
};
