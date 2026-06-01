// Nostalgic API の batchGet 正規レスポンス（visit/like 共通の上位集合）。
// 現状 osaka-kenpo は `total` のみ消費する（liked は /api/eeyan の D1 経路で別取得、
// today/yesterday/week/month は条文詳細ページ用に予約）。API 形と一致させるため全フィールド保持。
export interface NostalgicCountData {
  total: number;
  liked?: boolean;
  today?: number;
  yesterday?: number;
  week?: number;
  month?: number;
}

interface QueueEntry {
  ids: Set<string>;
  resolvers: Map<
    string,
    Array<{
      resolve: (data: NostalgicCountData) => void;
      reject: (error: unknown) => void;
    }>
  >;
  timer: ReturnType<typeof setTimeout> | null;
}

// 呼び出し側（osaka-kenpo は eeyan.ts の NOSTALGIC_BATCH_LIMIT）が batchLimit を渡すのが正。
// この定数は引数省略時の汎用フォールバック。Nostalgic API は 101 件以上で 500 を返す。
const DEFAULT_BATCH_LIMIT = 100;
const BATCH_DELAY_MS = 16;
const CACHE_TTL_MS = 5000;

const queues = new Map<string, QueueEntry>();
const cache = new Map<string, { data: NostalgicCountData; expiresAt: number }>();

function cacheKey(baseUrl: string, id: string): string {
  return `${baseUrl}|${id}`;
}

function getCached(baseUrl: string, id: string): NostalgicCountData | null {
  const key = cacheKey(baseUrl, id);
  const cached = cache.get(key);
  if (!cached || cached.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return cached.data;
}

function setCached(baseUrl: string, id: string, data: NostalgicCountData): void {
  cache.set(cacheKey(baseUrl, id), {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

async function flushQueue(baseUrl: string, batchLimit: number): Promise<void> {
  const queue = queues.get(baseUrl);
  if (!queue) return;
  queues.delete(baseUrl);

  const ids = [...queue.ids];
  for (let i = 0; i < ids.length; i += batchLimit) {
    const chunk = ids.slice(i, i + batchLimit);

    try {
      const response = await fetch(`${baseUrl}?action=batchGet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: chunk }),
      });
      if (!response.ok) {
        throw new Error(`batchGet failed: ${response.status}`);
      }

      const json = (await response.json()) as {
        success: boolean;
        data?: Record<string, NostalgicCountData>;
        error?: string;
      };
      if (!json.success || !json.data) {
        throw new Error(json.error || 'batchGet failed');
      }

      for (const id of chunk) {
        const data = json.data[id] || { total: 0 };
        setCached(baseUrl, id, data);
        for (const resolver of queue.resolvers.get(id) || []) {
          resolver.resolve(data);
        }
      }
    } catch (error) {
      // 失敗分はキャッシュしない（負のキャッシュは持たない）。呼び出し側が次回再取得できるようにする。
      for (const id of chunk) {
        for (const resolver of queue.resolvers.get(id) || []) {
          resolver.reject(error);
        }
      }
    }
  }
}

function requestNostalgicCount(
  baseUrl: string,
  id: string,
  batchLimit: number,
  force: boolean
): Promise<NostalgicCountData> {
  // force=false のときだけ 5 秒キャッシュを使う。ええやん操作直後の再取得は
  // force=true で必ずネットワークから最新カウントを取り、stale 表示を防ぐ。
  if (!force) {
    const cached = getCached(baseUrl, id);
    if (cached) {
      return Promise.resolve(cached);
    }
  }

  return new Promise((resolve, reject) => {
    let queue = queues.get(baseUrl);
    if (!queue) {
      queue = { ids: new Set(), resolvers: new Map(), timer: null };
      queues.set(baseUrl, queue);
    }

    queue.ids.add(id);
    if (!queue.resolvers.has(id)) {
      queue.resolvers.set(id, []);
    }
    queue.resolvers.get(id)?.push({ resolve, reject });

    if (!queue.timer) {
      queue.timer = setTimeout(() => {
        void flushQueue(baseUrl, batchLimit);
      }, BATCH_DELAY_MS);
    }
  });
}

export async function batchGetNostalgicCounts(
  baseUrl: string,
  ids: string[],
  batchLimit = DEFAULT_BATCH_LIMIT,
  force = false
): Promise<Record<string, NostalgicCountData>> {
  const uniqueIds = [...new Set(ids)];
  const entries = await Promise.all(
    uniqueIds.map(
      async (id) => [id, await requestNostalgicCount(baseUrl, id, batchLimit, force)] as const
    )
  );
  return Object.fromEntries(entries);
}
