// GET /api/[law_category]/[law]/[article]/batch - 条文バッチデータ

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { law_category, law, article } = context.params as {
    law_category: string;
    law: string;
    article: string;
  };

  if (!law_category || !law || !article) {
    return Response.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const parseJSON = (str: string | null) => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  try {
    // 並行して取得
    const [articleResult, lawResult, allArticlesResult] = await Promise.all([
      // 条文データ
      context.env.DB.prepare(
        `SELECT article, is_suppl, is_deleted, title, title_osaka,
                original_text, osaka_text, commentary, commentary_osaka
         FROM articles
         WHERE category = ? AND law_name = ? AND article = ?`
      ).bind(law_category, law, article).first(),

      // 法律メタデータ
      context.env.DB.prepare(
        `SELECT display_name, short_name, badge, year, source, description, links
         FROM laws
         WHERE category = ? AND name = ?`
      ).bind(law_category, law).first(),

      // 全条文リスト
      context.env.DB.prepare(
        `SELECT article, title, title_osaka
         FROM articles
         WHERE category = ? AND law_name = ?
         ORDER BY
           CASE
             WHEN article GLOB '[0-9]*' THEN CAST(article AS INTEGER)
             ELSE 999999
           END,
           article`
      ).bind(law_category, law).all(),
    ]);

    return Response.json({
      articleData: articleResult
        ? {
            article: articleResult.article,
            isSuppl: articleResult.is_suppl === 1,
            isDeleted: articleResult.is_deleted === 1,
            title: articleResult.title || '',
            titleOsaka: articleResult.title_osaka || '',
            originalText: parseJSON(articleResult.original_text as string),
            osakaText: parseJSON(articleResult.osaka_text as string),
            commentary: parseJSON(articleResult.commentary as string),
            commentaryOsaka: parseJSON(articleResult.commentary_osaka as string),
          }
        : null,
      lawMetadata: lawResult
        ? {
            name: lawResult.display_name,
            shortName: lawResult.short_name,
            badge: lawResult.badge,
            year: lawResult.year,
            source: lawResult.source,
            description: lawResult.description,
            links: parseJSON(lawResult.links as string),
          }
        : null,
      allArticles: allArticlesResult.results.map((a: any) => ({
        article: a.article,
        title: a.title || '',
        titleOsaka: a.title_osaka || '',
      })),
    });
  } catch (error) {
    console.error('Error fetching batch data:', error);
    return Response.json({ error: 'Failed to fetch batch data' }, { status: 500 });
  }
};
