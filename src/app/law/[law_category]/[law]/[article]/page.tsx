'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
  const { viewMode, setViewMode } = useViewMode(); // Global state
  const [articleData, setArticleData] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)

  const lawName = getLawName(params.law)

  // 表示モード切り替え関数
  const toggleViewMode = () => {
    setViewMode(viewMode === 'osaka' ? 'original' : 'osaka')
  }

  // キーボードショートカット（スペースキー）
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // フォーカス中の要素が入力欄等でない場合のみ
      if (event.code === 'Space' && 
          !['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName)) {
        event.preventDefault()
        toggleViewMode()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [viewMode, setViewMode])

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
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-4 relative">
          <div className="text-lg text-gray-600 mb-2">{lawName}</div>
          <AnimatedContent
            showOsaka={showOsaka}
            originalContent={
              <h1 className="text-3xl font-bold mb-6">
                <span className="text-[#E94E77]">第{articleData.article}条 </span>
                <span className="text-gray-800" dangerouslySetInnerHTML={{ __html: articleData.title }} />
              </h1>
            }
            osakaContent={
              <h1 className="text-3xl font-bold mb-6">
                <span className="text-[#E94E77]">第{articleData.article}条 </span>
                <span className="text-gray-800">{articleData.titleOsaka || articleData.title}</span>
              </h1>
            }
          />
          
          {/* 右上にシェアボタン */}
          <div className="absolute top-0 right-0">
            <ShareButton 
              title={`${lawName} 第${articleData.article}条 ${showOsaka ? (articleData.titleOsaka || articleData.title) : articleData.title}`}
            />
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* ナビゲーション */}
          <div className="mb-8">
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
            onDoubleClick={toggleViewMode}
            title="ダブルクリックまたはスペースキーで表示を切り替え"
          >
            <AnimatedContent
              showOsaka={showOsaka}
              originalContent={
                <div className="text-lg leading-relaxed text-gray-800">
                  <div 
                    dangerouslySetInnerHTML={{ __html: articleData.original }} 
                    className="mb-3"
                  />
                </div>
              }
              osakaContent={
                <div className="text-lg leading-relaxed osaka-text text-primary">
                  {articleData.osaka.split('\n').map((line, index) => (
                    <p key={index} className="mb-3">{line}</p>
                  ))}
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
            onDoubleClick={toggleViewMode}
            title="ダブルクリックまたはスペースキーで表示を切り替え"
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
                  <div className="text-gray-700 leading-relaxed">
                    {articleData.commentary.split('\n').map((line, index) => (
                      <p key={index} className="mb-3">{line}</p>
                    ))}
                  </div>
                }
                osakaContent={
                  <div className="text-gray-700 leading-relaxed osaka-text">
                    {(articleData.commentaryOsaka || articleData.commentary).split('\n').map((line, index) => (
                      <p key={index} className="mb-3">{line}</p>
                    ))}
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
            <p className="text-sm text-gray-500 mb-2">簡単切り替え操作</p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
              <span>📱 ダブルタップ</span>
              <span>⌨️ スペース</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}