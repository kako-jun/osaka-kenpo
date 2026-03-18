import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

function getDB() {
  const { env } = getRequestContext();
  return env.DB;
}

// --- Rate Limiting ---
// Simple sliding-window rate limiter using in-memory Map.
// On Cloudflare Workers each isolate is short-lived, so this provides
// per-isolate protection. For persistent rate limiting, use KV or Durable Objects.
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // max 30 requests per minute per IP

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);

  if (!entry) {
    entry = { timestamps: [] };
    rateLimitMap.set(ip, entry);
  }

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (entry.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  entry.timestamps.push(now);

  // Periodic cleanup: remove stale IPs to prevent memory growth
  if (rateLimitMap.size > 10_000) {
    for (const [key, val] of rateLimitMap) {
      const filtered = val.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (filtered.length === 0) {
        rateLimitMap.delete(key);
      }
    }
  }

  return false;
}

function rateLimitResponse() {
  return Response.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': '60' },
    }
  );
}

// --- userId Validation ---
// UUID v4 format: xxxxxxxx-xxxx-4xxx-[89ab]xxx-xxxxxxxxxxxx
const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUserId(userId: string): boolean {
  return UUID_V4_RE.test(userId);
}

// --- Input sanitisation ---
// Category and lawName should be safe path-like identifiers
const SAFE_ID_RE = /^[a-zA-Z0-9_-]{1,100}$/;
// Article can include numbers, letters, hyphens (e.g. "143b", "1-2")
const SAFE_ARTICLE_RE = /^[a-zA-Z0-9_.-]{1,50}$/;

function isValidCategory(v: string): boolean {
  return SAFE_ID_RE.test(v);
}
function isValidLawName(v: string): boolean {
  return SAFE_ID_RE.test(v);
}
function isValidArticle(v: string): boolean {
  return SAFE_ARTICLE_RE.test(v);
}

// POST: ええやんトグル
export async function POST(request: Request) {
  // Rate limiting
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return rateLimitResponse();
  }

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

    // Strict UUID v4 validation
    if (!isValidUserId(userId)) {
      return Response.json({ error: 'Invalid userId format' }, { status: 400 });
    }

    // Input sanitisation
    if (!isValidCategory(category)) {
      return Response.json({ error: 'Invalid category format' }, { status: 400 });
    }
    if (!isValidLawName(lawName)) {
      return Response.json({ error: 'Invalid lawName format' }, { status: 400 });
    }
    if (!isValidArticle(article)) {
      return Response.json({ error: 'Invalid article format' }, { status: 400 });
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
  // Rate limiting
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return rateLimitResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!isValidUserId(userId)) {
      return Response.json({ error: 'Invalid userId format' }, { status: 400 });
    }

    const db = getDB();
    const category = searchParams.get('category');
    const lawName = searchParams.get('lawName');

    if (category && lawName) {
      // Input sanitisation
      if (!isValidCategory(category) || !isValidLawName(lawName)) {
        return Response.json({ error: 'Invalid parameter format' }, { status: 400 });
      }

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
