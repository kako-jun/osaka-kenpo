'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArticleListItem } from '@/app/components/ArticleListItem';
import {
  NOSTALGIC_API_BASE,
  NOSTALGIC_COUNTER_API_BASE,
  NOSTALGIC_BATCH_LIMIT,
  getEeyanUserId,
  getNostalgicId,
} from '@/lib/eeyan';
import { useEeyanRevision } from '@/app/context/EeyanContext';

interface ArticleData {
  article: string;
  title: string;
  href: string;
  famousArticleBadge?: string | null;
  isDeleted?: boolean;
  originalText?: string;
}

interface ArticleListWithEeyanProps {
  articles: ArticleData[];
  lawCategory: string;
  law: string;
}

export function ArticleListWithEeyan({ articles, lawCategory, law }: ArticleListWithEeyanProps) {
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const eeyanRevision = useEeyanRevision();

  const fetchEeyanData = useCallback(async () => {
    const promises: Promise<void>[] = [];

    // nostalgic batchGet で全体カウント取得
    const nostalgicIds = articles.map((a) => getNostalgicId(lawCategory, law, a.article));
    const prefix = `osaka-kenpo-${lawCategory}-${law}-`;

    // Nostalgic APIの上限に合わせて分割
    for (let i = 0; i < nostalgicIds.length; i += NOSTALGIC_BATCH_LIMIT) {
      const batchIds = nostalgicIds.slice(i, i + NOSTALGIC_BATCH_LIMIT);

      // Like batchGet
      promises.push(
        fetch(`${NOSTALGIC_API_BASE}?action=batchGet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: batchIds }),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`batchGet failed: ${res.status}`);
            return res.json() as Promise<{
              success: boolean;
              data: Record<string, { total: number }>;
            }>;
          })
          .then((data) => {
            if (data.success && data.data) {
              const counts: Record<string, number> = {};
              for (const [nostalgicId, info] of Object.entries(data.data)) {
                if (nostalgicId.startsWith(prefix)) {
                  const articleId = nostalgicId.slice(prefix.length);
                  counts[articleId] = info.total;
                }
              }
              setLikeCounts((prev) => ({ ...prev, ...counts }));
            }
          })
          .catch(() => {})
      );

      // Counter batchGet（閲覧数）
      promises.push(
        fetch(`${NOSTALGIC_COUNTER_API_BASE}?action=batchGet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: batchIds }),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`counter batchGet failed: ${res.status}`);
            return res.json() as Promise<{
              success: boolean;
              data: Record<string, { total: number }>;
            }>;
          })
          .then((data) => {
            if (data.success && data.data) {
              const counts: Record<string, number> = {};
              for (const [nostalgicId, info] of Object.entries(data.data)) {
                if (nostalgicId.startsWith(prefix)) {
                  const articleId = nostalgicId.slice(prefix.length);
                  counts[articleId] = info.total;
                }
              }
              setViewCounts((prev) => ({ ...prev, ...counts }));
            }
          })
          .catch(() => {})
      );
    }

    // osaka-kenpo: 個人状態取得
    const userId = getEeyanUserId();
    if (userId) {
      promises.push(
        fetch(`/api/eeyan?userId=${userId}&category=${lawCategory}&lawName=${law}`)
          .then((res) => res.json() as Promise<{ success: boolean; likes: string[] }>)
          .then((data) => {
            if (data.success) {
              setUserLikes(new Set(data.likes));
            }
          })
          .catch(() => {})
      );
    }

    await Promise.all(promises);
  }, [articles, lawCategory, law]);

  // 初回マウント時 + props変更時に取得
  useEffect(() => {
    fetchEeyanData();
  }, [fetchEeyanData]);

  // ええやん操作後に再取得（別ページの LikeButton からの通知）
  useEffect(() => {
    if (eeyanRevision === 0) return; // 初回マウント時はスキップ
    fetchEeyanData();
  }, [eeyanRevision, fetchEeyanData]);

  // ページが再表示された時にデータを再取得（デバウンス付き）
  // （タブ切り替え、bfcache復元、他アプリからの復帰に対応）
  const visibilityTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(visibilityTimerRef.current);
        visibilityTimerRef.current = setTimeout(fetchEeyanData, 500);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(visibilityTimerRef.current);
    };
  }, [fetchEeyanData]);

  return (
    <>
      {articles.map((a) => (
        <ArticleListItem
          key={a.article}
          article={a.article}
          title={a.title}
          href={a.href}
          famousArticleBadge={a.famousArticleBadge}
          isDeleted={a.isDeleted}
          originalText={a.originalText}
          likeCount={likeCounts[a.article]}
          viewCount={viewCounts[a.article]}
          isLiked={userLikes.has(a.article)}
        />
      ))}
    </>
  );
}
