'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [articleCount, setArticleCount] = useState<number>(17) // 十七条憲法のデフォルト
  const [showArticlePopup, setShowArticlePopup] = useState<boolean>(false)

  // 法律ごとの条文数を取得（必要に応じて拡張）
  useEffect(() => {
    if (law === 'jushichijo_kenpo') {
      setArticleCount(17)
    }
    // 他の法律の条文数も追加可能
  }, [law])

  const prevArticle = currentArticle > 1 ? currentArticle - 1 : null
  const nextArticle = currentArticle < articleCount ? currentArticle + 1 : null

  const handleArticleSelect = (articleNum: number) => {
    setShowArticlePopup(false)
    router.push(`/law/${lawCategory}/${law}/${articleNum}`)
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
              href={`/law/${lawCategory}/${law}/${prevArticle}`}
              className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              第{prevArticle}条
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setShowArticlePopup(true)}
              className="text-gray-500 font-medium hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors cursor-pointer"
            >
              第{currentArticle} / {articleCount}条
            </button>

            {/* ポップアップ */}
            {showArticlePopup && (
              <>
                {/* オーバーレイ */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setShowArticlePopup(false)}
                />
                
                {/* ポップアップ本体 */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-96 max-h-96 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">条文を選択</h3>
                      <button
                        onClick={() => setShowArticlePopup(false)}
                        className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: articleCount }, (_, i) => i + 1).map((articleNum) => (
                        <button
                          key={articleNum}
                          onClick={() => handleArticleSelect(articleNum)}
                          className={`
                            py-3 px-4 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                            ${articleNum === currentArticle 
                              ? 'bg-[#E94E77] text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                            }
                          `}
                        >
                          第{articleNum}条
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {nextArticle && (
            <Link
              href={`/law/${lawCategory}/${law}/${nextArticle}`}
              className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors whitespace-nowrap"
            >
              第{nextArticle}条
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* スマホ用レイアウト */}
      <div className="sm:hidden">
        {/* 戻る */}
        <div className="mb-4">
          <Link
            href={`/law/${lawCategory}/${law}`}
            className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            条文一覧へ
          </Link>
        </div>

        {/* 前後のナビゲーション */}
        <div className="flex justify-center items-center space-x-3">
          {prevArticle && (
            <Link
              href={`/law/${lawCategory}/${law}/${prevArticle}`}
              className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors whitespace-nowrap text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              第{prevArticle}条
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setShowArticlePopup(true)}
              className="text-gray-500 font-medium hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm whitespace-nowrap"
            >
              第{currentArticle} / {articleCount}条
            </button>

            {/* スマホ用ポップアップ */}
            {showArticlePopup && (
              <>
                {/* オーバーレイ */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setShowArticlePopup(false)}
                />
                
                {/* ポップアップ本体 */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-80 max-h-96 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">条文を選択</h3>
                      <button
                        onClick={() => setShowArticlePopup(false)}
                        className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: articleCount }, (_, i) => i + 1).map((articleNum) => (
                        <button
                          key={articleNum}
                          onClick={() => handleArticleSelect(articleNum)}
                          className={`
                            py-3 px-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                            ${articleNum === currentArticle 
                              ? 'bg-[#E94E77] text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                            }
                          `}
                        >
                          第{articleNum}条
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {nextArticle && (
            <Link
              href={`/law/${lawCategory}/${law}/${nextArticle}`}
              className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors whitespace-nowrap text-sm"
            >
              第{nextArticle}条
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}