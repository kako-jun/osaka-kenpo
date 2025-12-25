// GET /api/metadata/[law_category]/[law]/batch - 法律メタデータバッチ

/// <reference path="../../../../env.d.ts" />

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { law_category, law } = context.params as {
    law_category: string;
    law: string;
  };

  if (!law_category || !law) {
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
    // 並行して取得
    const [lawResult, chaptersResult, famousResult] = await Promise.all([
      // 法律メタデータ
      context.env.DB.prepare(
        `SELECT display_name, short_name, badge, year, source, description, links
         FROM laws
         WHERE category = ? AND name = ?`
      )
        .bind(law_category, law)
        .first(),

      // 章データ
      context.env.DB.prepare(
        `SELECT chapter, title, title_osaka, description, description_osaka, articles
         FROM chapters
         WHERE category = ? AND law_name = ?
         ORDER BY chapter`
      )
        .bind(law_category, law)
        .all(),

      // 有名条文
      context.env.DB.prepare(
        `SELECT article, badge
         FROM famous_articles
         WHERE category = ? AND law_name = ?`
      )
        .bind(law_category, law)
        .all(),
    ]);

    // 有名条文をオブジェクトに変換
    const famousArticles: Record<string, string> = {};
    for (const fa of famousResult.results) {
      famousArticles[fa.article as string] = fa.badge as string;
    }

    return Response.json({
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
      chapters:
        chaptersResult.results.length > 0
          ? {
              chapters: chaptersResult.results.map((ch: any) => ({
                chapter: ch.chapter,
                title: ch.title,
                titleOsaka: ch.title_osaka,
                description: ch.description,
                descriptionOsaka: ch.description_osaka,
                articles: parseJSON(ch.articles),
              })),
            }
          : null,
      famousArticles: Object.keys(famousArticles).length > 0 ? famousArticles : null,
    });
  } catch (error) {
    console.error('Error fetching law batch metadata:', error);
    return Response.json({ error: 'Failed to fetch batch metadata' }, { status: 500 });
  }
};
