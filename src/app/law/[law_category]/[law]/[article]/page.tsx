'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useViewMode } from '../../../../context/ViewModeContext'
import { getLawName } from '@/lib/law-mappings'
import { generateBreadcrumbs } from '@/lib/utils'
import { SpeakerButton } from '@/components/SpeakerButton'
import { ShareButton } from '@/app/components/ShareButton'
import { ArticleNavigation } from '@/app/components/ArticleNavigation'
import { AnimatedContent } from '@/app/components/AnimatedContent'
import type { ArticleData } from '@/lib/types'

export default function ArticlePage() {
  const params = useParams<{ law_category: string; law: string; article: string }>()
  const router = useRouter()
  const { viewMode, setViewMode } = useViewMode(); // Global state
  const [articleData, setArticleData] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)

  const lawName = getLawName(params.law)

  // 表示モード切り替え関数
  const toggleViewMode = () => {
    setViewMode(viewMode === 'osaka' ? 'original' : 'osaka')
  }

  // 条文ナビゲーション関数
  const navigateToArticle = (articleNum: number) => {
    router.push(`/law/${params.law_category}/${params.law}/${articleNum}`)
  }

  // 前後の条文番号を計算（十七条憲法の場合）
  const currentArticleNum = articleData?.article || parseInt(params.article)
  const maxArticles = 17 // 十七条憲法の総条文数
  const prevArticle = currentArticleNum > 1 ? currentArticleNum - 1 : null
  const nextArticle = currentArticleNum < maxArticles ? currentArticleNum + 1 : null

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // フォーカス中の要素が入力欄等でない場合のみ
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName)
      
      if (!isInputFocused) {
        if (event.code === 'Space') {
          event.preventDefault()
          toggleViewMode()
        } else if (event.code === 'ArrowLeft' && prevArticle) {
          event.preventDefault()
          navigateToArticle(prevArticle)
        } else if (event.code === 'ArrowRight' && nextArticle) {
          event.preventDefault()
          navigateToArticle(nextArticle)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [viewMode, setViewMode, prevArticle, nextArticle, navigateToArticle])

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const response = await fetch(`/api/${params.law_category}/${params.law}/${params.article}`)
        if (response.ok) {
          const result = await response.json()
          // API response format: { data: ArticleData, ... }
          if (result.data) {
            setArticleData(result.data)
          } else {
            // Legacy format fallback
            setArticleData(result)
          }
        } else {
          console.error('Failed to load article:', response.status)
        }
      } catch (error) {
        console.error('Failed to load article:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.law_category && params.law && params.article) {
      loadArticle()
    }
  }, [params.law_category, params.law, params.article])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-primary text-xl">読み込み中...</div>
      </div>
    )
  }

  if (!articleData) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">
              条文が見つかりません
            </h1>
            <a href="/" className="text-blue-600 hover:underline">
              トップページに戻る
            </a>
          </div>
        </div>
      </div>
    )
  }

  const showOsaka = viewMode === 'osaka';

  return (
    <main className="min-h-screen bg-cream relative">
      {/* 右上にシェアボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton 
          title={`${lawName} 第${articleData.article}条 ${showOsaka ? (articleData.titleOsaka || articleData.title) : articleData.title}`}
        />
      </div>
      
      {/* 前の条文への矢印 */}
      {prevArticle && (
        <button
          onClick={() => navigateToArticle(prevArticle)}
          className="fixed left-0 top-32 bottom-20 w-16 z-10 text-gray-300 hover:text-[#E94E77] transition-all flex items-center justify-center group"
          title={`第${prevArticle}条へ`}
          style={{
            background: 'transparent'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-80 transition-opacity"></div>
          <svg width="24" height="60" viewBox="0 0 24 60" fill="currentColor" className="relative z-10">
            <path d="M20 10 L8 30 L20 50" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      
      {/* 次の条文への矢印 */}
      {nextArticle && (
        <button
          onClick={() => navigateToArticle(nextArticle)}
          className="fixed right-0 top-32 bottom-20 w-16 z-10 text-gray-300 hover:text-[#E94E77] transition-all flex items-center justify-center group"
          title={`第${nextArticle}条へ`}
          style={{
            background: 'transparent'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-80 transition-opacity"></div>
          <svg width="24" height="60" viewBox="0 0 24 60" fill="currentColor" className="relative z-10">
            <path d="M4 10 L16 30 L4 50" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-4">
          <Link 
            href={`/law/${params.law_category}/${params.law}`}
            className="inline-block text-lg text-gray-600 mb-2 hover:text-[#E94E77] transition-colors"
          >
            {lawName}
          </Link>
          <AnimatedContent
            showOsaka={showOsaka}
            originalContent={
              <h1 className="text-2xl font-bold mb-6">
                <span className="text-[#E94E77]">第{articleData.article}条 </span>
                <span className="text-gray-800" dangerouslySetInnerHTML={{ __html: articleData.title }} />
              </h1>
            }
            osakaContent={
              <h1 className="text-2xl font-bold mb-6">
                <span className="text-[#E94E77]">第{articleData.article}条 </span>
                <span className="text-gray-800">{articleData.titleOsaka || articleData.title}</span>
              </h1>
            }
          />
        </header>

        <div className="max-w-4xl mx-auto">
          {/* ナビゲーション */}
          <div className="mb-8 select-none">
            <ArticleNavigation 
              lawCategory={params.law_category}
              law={params.law}
              currentArticle={articleData.article}
              lawName={lawName}
            />
          </div>

          {/* 条文表示 */}
          <div 
            className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8 relative cursor-pointer select-none"
            onClick={toggleViewMode}
            title="クリックまたはスペースキーで表示を切り替え"
          >
            <AnimatedContent
              showOsaka={showOsaka}
              originalContent={
                <div className="text-lg leading-relaxed">
                  <div className="text-gray-800">
                    {articleData.original.split('\n').map((line, index) => (
                      <p key={index} className="mb-3">{line}</p>
                    ))}
                  </div>
                </div>
              }
              osakaContent={
                <div className="text-lg leading-relaxed">
                  <div className="text-gray-800" style={{ color: 'var(--primary-color)' }}>
                    {articleData.osaka.split('\n').map((line, index) => (
                      <p key={index} className="mb-3">{line}</p>
                    ))}
                  </div>
                </div>
              }
            />
            
            {/* 条文用スピーカーボタン */}
            <div className="absolute bottom-4 right-4">
              <SpeakerButton 
                text={showOsaka ? articleData.osaka : articleData.original}
                voice={showOsaka ? 'female' : 'male'}
              />
            </div>
          </div>

          {/* 解説 */}
          <div 
            className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-6 border-2 border-red-400 relative cursor-pointer select-none"
            onClick={toggleViewMode}
            title="クリックまたはスペースキーで表示を切り替え"
          >
            {/* 解説アイコン */}
            <div className="absolute -top-4 left-6 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
              <span className="text-sm font-bold">💡</span>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center">
                <span className="mr-2">💬</span>
                ワンポイント解説
              </h3>
              <AnimatedContent
                showOsaka={showOsaka}
                originalContent={
                  <div className="leading-relaxed">
                    <div className="text-gray-700">
                      {articleData.commentary.split('\n').map((line, index) => (
                        <p key={index} className="mb-3">{line}</p>
                      ))}
                    </div>
                  </div>
                }
                osakaContent={
                  <div className="leading-relaxed">
                    <div className="text-gray-700" style={{ color: 'var(--primary-color)' }}>
                      {(articleData.commentaryOsaka || articleData.commentary).split('\n').map((line, index) => (
                        <p key={index} className="mb-3">{line}</p>
                      ))}
                    </div>
                  </div>
                }
              />
            </div>
            
            {/* 解説用スピーカーボタン */}
            <div className="absolute bottom-4 right-4">
              <SpeakerButton 
                text={showOsaka ? (articleData.commentaryOsaka || articleData.commentary) : articleData.commentary}
                voice={showOsaka ? 'female' : 'male'}
              />
            </div>
          </div>

          {/* 操作説明 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">簡単操作</p>
            <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
              <span>🖱️ クリック、⌨️ スペースキー：言語の切り替え</span>
              <span>⌨️ ← → キー：前後の条文へ</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}