// GET /api/metadata/[law_category]/[law]/[metadata_type] - 特定のメタデータ取得

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { law_category, law, metadata_type } = context.params as {
    law_category: string;
    law: string;
    metadata_type: string;
  };

  if (!law_category || !law || !metadata_type) {
    return Response.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const parseJSON = (str: string | null) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  try {
    switch (metadata_type) {
      case 'law_metadata': {
        const result = await context.env.DB.prepare(
          `SELECT display_name, short_name, badge, year, source, description, links
           FROM laws
           WHERE category = ? AND name = ?`
        ).bind(law_category, law).first();

        if (!result) {
          return Response.json({ error: 'Law not found' }, { status: 404 });
        }

        return Response.json({
          name: result.display_name,
          shortName: result.short_name,
          badge: result.badge,
          year: result.year,
          source: result.source,
          description: result.description,
          links: parseJSON(result.links as string),
        });
      }

      case 'chapters': {
        const { results } = await context.env.DB.prepare(
          `SELECT chapter, title, title_osaka, description, description_osaka, articles
           FROM chapters
           WHERE category = ? AND law_name = ?
           ORDER BY chapter`
        ).bind(law_category, law).all();

        if (results.length === 0) {
          return Response.json({ error: 'Chapters not found' }, { status: 404 });
        }

        return Response.json({
          chapters: results.map((ch: any) => ({
            chapter: ch.chapter,
            title: ch.title,
            titleOsaka: ch.title_osaka,
            description: ch.description,
            descriptionOsaka: ch.description_osaka,
            articles: parseJSON(ch.articles),
          })),
        });
      }

      case 'famous_articles': {
        const { results } = await context.env.DB.prepare(
          `SELECT article, badge
           FROM famous_articles
           WHERE category = ? AND law_name = ?`
        ).bind(law_category, law).all();

        const famousArticles: Record<string, string> = {};
        for (const fa of results) {
          famousArticles[fa.article as string] = fa.badge as string;
        }

        return Response.json(famousArticles);
      }

      default:
        return Response.json({ error: 'Unknown metadata type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return Response.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
};
