'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ArticleNavigationProps {
  lawCategory: string
  law: string
  currentArticle: number
  lawName: string
}

export const ArticleNavigation = ({ 
  lawCategory, 
  law, 
  currentArticle, 
  lawName 
}: ArticleNavigationProps) => {
  const [articleCount, setArticleCount] = useState<number>(17) // 十七条憲法のデフォルト

  // 法律ごとの条文数を取得（必要に応じて拡張）
  useEffect(() => {
    if (law === 'jushichijo_kenpo') {
      setArticleCount(17)
    }
    // 他の法律の条文数も追加可能
  }, [law])

  const prevArticle = currentArticle > 1 ? currentArticle - 1 : null
  const nextArticle = currentArticle < articleCount ? currentArticle + 1 : null

  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* 戻る */}
      <Link
        href={`/law/${lawCategory}/${law}`}
        className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
条文一覧へ
      </Link>

      {/* 前後のナビゲーション */}
      <div className="flex items-center space-x-4">
        {prevArticle && (
          <Link
            href={`/law/${lawCategory}/${law}/${prevArticle}`}
            className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            第{prevArticle}条
          </Link>
        )}

        <span className="text-gray-500 font-medium">
          第{currentArticle} / {articleCount}条
        </span>

        {nextArticle && (
          <Link
            href={`/law/${lawCategory}/${law}/${nextArticle}`}
            className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
          >
            第{nextArticle}条
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  )
}