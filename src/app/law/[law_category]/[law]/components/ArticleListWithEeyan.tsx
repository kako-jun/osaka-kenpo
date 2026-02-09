'use client';

import { useState, useEffect } from 'react';
import { ArticleListItem } from '@/app/components/ArticleListItem';
import { NOSTALGIC_API_BASE, getEeyanUserId, getNostalgicId } from '@/lib/eeyan';

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
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchEeyanData = async () => {
      const promises: Promise<void>[] = [];

      // nostalgic batchGet で全体カウント取得
      const nostalgicIds = articles.map((a) => getNostalgicId(lawCategory, law, a.article));

      // 1000件ずつ分割
      for (let i = 0; i < nostalgicIds.length; i += 1000) {
        const batchIds = nostalgicIds.slice(i, i + 1000);
        promises.push(
          fetch(`${NOSTALGIC_API_BASE}?action=batchGet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: batchIds }),
          })
            .then(
              (res) =>
                res.json() as Promise<{ success: boolean; data: Record<string, { total: number }> }>
            )
            .then((data) => {
              if (data.success && data.data) {
                const counts: Record<string, number> = {};
                for (const [nostalgicId, info] of Object.entries(data.data)) {
                  // osaka-kenpo-{category}-{law}- を取り除いて article ID に変換
                  const prefix = `osaka-kenpo-${lawCategory}-${law}-`;
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
    };

    fetchEeyanData();
  }, [articles, lawCategory, law]);

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
          isLiked={userLikes.has(a.article)}
        />
      ))}
    </>
  );
}
