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
      // 全法律横断のええやん一覧
      const result = await db
        .prepare(
          'SELECT category, law_name as lawName, article, created_at as createdAt FROM user_likes WHERE user_id = ? ORDER BY created_at DESC'
        )
        .bind(userId)
        .all<{ category: string; lawName: string; article: string; createdAt: string }>();
      return Response.json({
        success: true,
        likes: result.results,
      });
    }
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
