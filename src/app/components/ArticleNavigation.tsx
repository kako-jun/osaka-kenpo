'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ArticleNavigationProps {
  lawCategory: string
  law: string
  currentArticle: number | string
  lawName: string
  allArticles?: ArticleItem[]
}

interface ArticleItem {
  article: string | number
  title: string
  titleOsaka?: string
}

export const ArticleNavigation = ({ 
  lawCategory, 
  law, 
  currentArticle, 
  lawName,
  allArticles: propArticles
}: ArticleNavigationProps) => {
  const router = useRouter()
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [showArticlePopup, setShowArticlePopup] = useState<boolean>(false)

  // propsで渡された条文リストがあれば使用、なければAPIから取得
  useEffect(() => {
    if (propArticles && propArticles.length > 0) {
      setArticles(propArticles)
      return
    }

    const fetchArticles = async () => {
      try {
        const response = await fetch(`/api/${lawCategory}/${law}`)
        if (response.ok) {
          const result = await response.json()
          const articleList = result.data || result
          if (Array.isArray(articleList)) {
            setArticles(articleList)
          }
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error)
        setArticles([])
      }
    }

    if (lawCategory && law) {
      fetchArticles()
    }
  }, [lawCategory, law, propArticles])

  // 現在の条文のインデックスを取得
  const currentIndex = articles.findIndex(article => String(article.article) === String(currentArticle))
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null

  const handleArticleSelect = (articleId: string | number) => {
    setShowArticlePopup(false)
    router.push(`/law/${lawCategory}/${law}/${articleId}`)
  }

  // 条文番号を表示用にフォーマット
  const formatArticleNumber = (article: string | number) => {
    if (typeof article === 'number') return `第${article}条`
    if (String(article).startsWith('fusoku_')) {
      return `附則第${String(article).replace('fusoku_', '')}条`
    }
    return `第${article}条`
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      {/* PC用レイアウト */}
      <div className="hidden sm:flex justify-between items-center">
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
              href={`/law/${lawCategory}/${law}/${prevArticle.article}`}
              className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {formatArticleNumber(prevArticle.article)}
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setShowArticlePopup(true)}
              className="text-gray-500 font-medium hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors cursor-pointer"
            >
              {formatArticleNumber(currentArticle)} ({currentIndex + 1} / {articles.length})
            </button>

            {/* ポップアップ */}
            {showArticlePopup && (
              <>
                {/* オーバーレイ */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setShowArticlePopup(false)}
                />
                
                {/* ポップアップ内容 */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto" style={{ minWidth: '300px', maxWidth: '400px' }}>
                  <div className="p-4 border-b border-gray-200" style={{ backgroundColor: '#FFF8DC' }}>
                    <h3 className="font-medium" style={{ color: '#8B4513' }}>📖 条文を選択しなはれ</h3>
                  </div>
                  <div className="py-2">
                    {articles.map((article) => (
                      <button
                        key={article.article}
                        onClick={() => handleArticleSelect(article.article)}
                        className={`w-full text-left px-4 py-2 transition-colors hover:bg-gray-100 ${
                          String(article.article) === String(currentArticle) 
                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-400' 
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{formatArticleNumber(article.article)}</span>
                        {article.title && <span className="ml-2 text-sm text-gray-600">{article.title}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {nextArticle && (
            <Link
              href={`/law/${lawCategory}/${law}/${nextArticle.article}`}
              className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors whitespace-nowrap"
            >
              {formatArticleNumber(nextArticle.article)}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* モバイル用レイアウト */}
      <div className="sm:hidden">
        {/* 戻る */}
        <div className="mb-3">
          <Link
            href={`/law/${lawCategory}/${law}`}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            条文一覧へ
          </Link>
        </div>

        {/* 前後のナビゲーション */}
        <div className="flex justify-between items-center">
          {prevArticle ? (
            <Link
              href={`/law/${lawCategory}/${law}/${prevArticle.article}`}
              className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors text-sm"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              前
            </Link>
          ) : (
            <div></div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowArticlePopup(true)}
              className="text-gray-500 font-medium hover:text-blue-600 px-2 py-1 text-sm"
            >
              {formatArticleNumber(currentArticle)} ({currentIndex + 1}/{articles.length})
            </button>
          </div>

          {nextArticle ? (
            <Link
              href={`/law/${lawCategory}/${law}/${nextArticle.article}`}
              className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors text-sm"
            >
              次
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  )
}