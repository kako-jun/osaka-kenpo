import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

function getDB() {
  const { env } = getRequestContext();
  return env.DB;
}

// POST: ええやんトグル
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: string;
      category?: string;
      lawName?: string;
      article?: string;
    };
    const { userId, category, lawName, article } = body;

    if (!userId || !category || !lawName || !article) {
      return Response.json(
        { error: 'userId, category, lawName, article are required' },
        { status: 400 }
      );
    }

    // UUID format validation
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      return Response.json({ error: 'Invalid userId format' }, { status: 400 });
    }

    const db = getDB();

    // Check if already liked
    const existing = await db
      .prepare(
        'SELECT 1 FROM user_likes WHERE user_id = ? AND category = ? AND law_name = ? AND article = ?'
      )
      .bind(userId, category, lawName, article)
      .first();

    if (existing) {
      // Unlike - delete
      await db
        .prepare(
          'DELETE FROM user_likes WHERE user_id = ? AND category = ? AND law_name = ? AND article = ?'
        )
        .bind(userId, category, lawName, article)
        .run();
      return Response.json({ success: true, liked: false });
    } else {
      // Like - insert
      await db
        .prepare(
          'INSERT INTO user_likes (user_id, category, law_name, article) VALUES (?, ?, ?, ?)'
        )
        .bind(userId, category, lawName, article)
        .run();
      return Response.json({ success: true, liked: true });
    }
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: ええやん一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      return Response.json({ error: 'Invalid userId format' }, { status: 400 });
    }

    const db = getDB();
    const category = searchParams.get('category');
    const lawName = searchParams.get('lawName');

    if (category && lawName) {
      // 法律ごとの個人ええやん一覧（条文IDの配列を返す）
      const result = await db
        .prepare(
          'SELECT article FROM user_likes WHERE user_id = ? AND category = ? AND law_name = ? ORDER BY article'
        )
        .bind(userId, category, lawName)
        .all<{ article: string }>();
      return Response.json({
        success: true,
        likes: result.results.map((r) => r.article),
      });
    } else {
      // 全法律横断のええやん一覧（タイトルと原文も取得）
      const result = await db
        .prepare(
          `SELECT ul.category, ul.law_name as lawName, ul.article, ul.created_at as createdAt,
                  a.title, a.original_text as originalText
           FROM user_likes ul
           LEFT JOIN articles a ON ul.category = a.category AND ul.law_name = a.law_name AND ul.article = a.article
           WHERE ul.user_id = ?
           ORDER BY ul.created_at DESC`
        )
        .bind(userId)
        .all<{
          category: string;
          lawName: string;
          article: string;
          createdAt: string;
          title: string | null;
          originalText: string | null;
        }>();

      // originalText はJSONなので最初の段落を抽出
      const likes = result.results.map((r) => {
        let firstParagraph = '';
        if (r.originalText) {
          try {
            const parsed = JSON.parse(r.originalText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              firstParagraph = String(parsed[0]);
            }
          } catch {
            // ignore
          }
        }
        return {
          category: r.category,
          lawName: r.lawName,
          article: r.article,
          createdAt: r.createdAt,
          title: r.title || '',
          originalText: firstParagraph,
        };
      });

      return Response.json({
        success: true,
        likes,
      });
    }
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
