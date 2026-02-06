'use client';
import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

export interface ArticleItem {
  article: string | number;
  title: string;
  titleOsaka?: string;
}

export function useArticleList(lawCategory: string, law: string, propArticles?: ArticleItem[]) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);

  useEffect(() => {
    if (propArticles && propArticles.length > 0) {
      setArticles(propArticles);
      return;
    }

    const fetchArticles = async () => {
      try {
        const response = await fetch(`/api/${lawCategory}/${law}`);
        if (response.ok) {
          const result = (await response.json()) as { data?: ArticleItem[] } | ArticleItem[];
          const articleList = Array.isArray(result) ? result : result.data;
          if (Array.isArray(articleList)) {
            setArticles(articleList);
          }
        }
      } catch (error) {
        logger.error('Failed to fetch articles', error, { lawCategory, law });
        setArticles([]);
      }
    };

    if (lawCategory && law) {
      fetchArticles();
    }
  }, [lawCategory, law, propArticles]);

  return articles;
}
