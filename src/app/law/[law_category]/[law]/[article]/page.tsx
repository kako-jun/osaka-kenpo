'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useViewMode } from '@/app/context/ViewModeContext'
import { loadArticleBatchData } from '@/lib/metadata_loader'
import { SpeakerButton } from '@/components/SpeakerButton'
import { ShareButton } from '@/app/components/ShareButton'
import { LikeButton } from '@/app/components/LikeButton'
import { ArticleNavigation } from '@/app/components/ArticleNavigation'
import { AnimatedContent } from '@/app/components/AnimatedContent'
import { KasugaLoading } from '@/app/components/KasugaLoading'
import { highlightKeywords } from '@/lib/text_highlight'
import type { ArticleData } from '@/lib/types'

export default function ArticlePage() {
  const params = useParams<{ law_category: string; law: string; article: string }>()
  const router = useRouter()
  const { viewMode, setViewMode } = useViewMode(); // Global state
  const [articleData, setArticleData] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lawName, setLawName] = useState<string>('')
  const [allArticles, setAllArticles] = useState<any[]>([])

  // 表示モード切り替え関数
  const toggleViewMode = () => {
    setViewMode(viewMode === 'osaka' ? 'original' : 'osaka')
  }

  // 条文ナビゲーション関数
  const navigateToArticle = (articleNum: number) => {
    router.push(`/law/${params.law_category}/${params.law}/${articleNum}`)
  }

  // 前後の条文番号を計算
  const currentArticleNum = articleData?.article || parseInt(params.article)
  const [maxArticles, setMaxArticles] = useState<number>(1)
  const prevArticle = currentArticleNum > 1 ? currentArticleNum - 1 : null
  const nextArticle = currentArticleNum < maxArticles ? currentArticleNum + 1 : null

  // キーボードショートカットとスワイプジェスチャー
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

    // スワイプジェスチャー
    let touchStartX = 0
    let touchEndX = 0
    let isTracking = false
    
    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0].screenX
      isTracking = true
      
      // ページ全体のコンテンツを取得（fixedボタン以外）
      const pageContent = document.getElementById('page-content') as HTMLElement | null
      if (pageContent) {
        pageContent.style.transition = 'none'
      }
    }
    
    const handleTouchMove = (event: TouchEvent) => {
      if (!isTracking) return
      
      const touchCurrentX = event.changedTouches[0].screenX
      const currentDistance = touchCurrentX - touchStartX
      
      // スワイプ演出：ページコンテンツを縮小
      const progress = Math.min(Math.abs(currentDistance) / 100, 1) // 0-1の範囲
      const scale = 1 - (progress * 0.05) // 最大5%縮小
      
      const pageContent = document.getElementById('page-content') as HTMLElement | null
      if (pageContent) {
        pageContent.style.transform = `scale(${scale})`
        pageContent.style.opacity = String(1 - progress * 0.3) // 最大30%透明化
      }
    }
    
    const handleTouchEnd = (event: TouchEvent) => {
      if (!isTracking) return
      
      touchEndX = event.changedTouches[0].screenX
      isTracking = false
      
      const swipeThreshold = 100
      const swipeDistance = touchEndX - touchStartX
      
      // 必ず元に戻す処理を先に実行
      const pageContent = document.getElementById('page-content') as HTMLElement | null
      if (pageContent) {
        pageContent.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        pageContent.style.transform = 'scale(1)';
        pageContent.style.opacity = '1'
        
        setTimeout(() => {
          pageContent.style.transition = '';
          pageContent.style.transform = '';
          pageContent.style.opacity = ''
        }, 300)
      }
      
      // スワイプが閾値を超えた場合は遷移
      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0 && prevArticle) {
          // 右スワイプ（左から右へ）→ 前の条文
          navigateToArticle(prevArticle)
        } else if (swipeDistance < 0 && nextArticle) {
          // 左スワイプ（右から左へ）→ 次の条文
          navigateToArticle(nextArticle)
        }
      }
    }
    

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [viewMode, setViewMode, prevArticle, nextArticle, navigateToArticle])

  useEffect(() => {
    // ページ遷移時にスタイルをリセット
    const pageContent = document.getElementById('page-content') as HTMLElement | null
    if (pageContent) {
      pageContent.style.transform = '';
      pageContent.style.opacity = '';
      pageContent.style.transition = ''
    }
    
    const loadArticle = async () => {
      try {
        // 条文データ、法律メタデータ、全条文リストを一度に取得
        const { articleData, lawMetadata, allArticles } = await loadArticleBatchData(
          params.law_category, 
          params.law, 
          params.article
        )
        
        if (articleData) {
          setArticleData(articleData)
        } else {
          console.error('Failed to load article data')
        }
        
        // 法律名を設定（通称があれば通称を使用）
        setLawName(lawMetadata?.shortName || lawMetadata?.name || params.law)
        
        // 全条文リストから最大条文数を設定し、stateに保存
        if (allArticles && allArticles.length > 0) {
          setAllArticles(allArticles)
          const maxArticle = Math.max(...allArticles.map(article => {
            if (typeof article.article === 'number') return article.article
            if (typeof article.article === 'string' && article.article.startsWith('fusoku_')) {
              return parseInt(article.article.replace('fusoku_', '')) + 1000 // 附則は大きな数値として扱う
            }
            return parseInt(String(article.article))
          }))
          setMaxArticles(maxArticle > 1000 ? maxArticle - 1000 : maxArticle) // 附則用の調整を元に戻す
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
      <div className="min-h-screen bg-cream">
        <KasugaLoading />
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
      {/* 左上にええやんボタン */}
      <div className="fixed top-20 left-4 z-10">
        <LikeButton 
          articleId={params.article}
          lawCategory={params.law_category}
          law={params.law}
        />
      </div>

      {/* 右上に広めたるボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton 
          title={`${lawName} ${typeof articleData.article === 'number' ? `第${articleData.article}条` : (
            articleData.article.startsWith('fusoku_') ? `附則第${articleData.article.replace('fusoku_', '')}条` : `第${articleData.article}条`
          )} ${showOsaka ? (articleData.titleOsaka || articleData.title) : articleData.title}`}
        />
      </div>
      
      {/* 前の条文への矢印 */}
      {prevArticle && (
        <button
          onClick={() => navigateToArticle(prevArticle)}
          className="fixed left-0 top-32 bottom-32 w-8 z-[1] text-gray-300 hover:text-[#E94E77] transition-all flex items-center justify-center group"
          title={`第${prevArticle}条へ`}
          style={{
            background: 'transparent'
          }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-80 transition-opacity"
          ></div>
          <svg width="24" height="60" viewBox="0 0 24 60" fill="currentColor" className="relative z-10">
            <path d="M20 10 L8 30 L20 50" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      
      {/* 次の条文への矢印 */}
      {nextArticle && (
        <button
          onClick={() => navigateToArticle(nextArticle)}
          className="fixed right-0 top-32 bottom-32 w-8 z-[1] text-gray-300 hover:text-[#E94E77] transition-all flex items-center justify-center group"
          title={`第${nextArticle}条へ`}
          style={{
            background: 'transparent'
          }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-80 transition-opacity"
          ></div>
          <svg width="24" height="60" viewBox="0 0 24 60" fill="currentColor" className="relative z-10">
            <path d="M4 10 L16 30 L4 50" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      
      {/* ページコンテンツ全体をラップ */}
      <div id="page-content">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-4">
          {/* 法律名の表示（通称使用） */}
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
                <span className="text-[#E94E77]">
                  {typeof articleData.article === 'number' ? `第${articleData.article}条` : (
                    articleData.article.startsWith('fusoku_') ? `附則第${articleData.article.replace('fusoku_', '')}条` : `第${articleData.article}条`
                  )}{' '}
                </span>
                <span className="text-gray-800" dangerouslySetInnerHTML={{ __html: articleData.title }} />
              </h1>
            }
            osakaContent={
              <h1 className="text-2xl font-bold mb-6">
                <span className="text-[#E94E77]">
                  {typeof articleData.article === 'number' ? `第${articleData.article}条` : (
                    articleData.article.startsWith('fusoku_') ? `附則第${articleData.article.replace('fusoku_', '')}条` : `第${articleData.article}条`
                  )}{' '}
                </span>
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
              allArticles={allArticles}
            />
          </div>

          {/* 条文表示 */}
          <div 
            className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8 relative cursor-pointer select-none"
            onClick={(e) => {
              // スピーカーボタンがクリックされた場合は言語切り替えしない
              if ((e.target as HTMLElement).closest('button')) {
                return;
              }
              toggleViewMode();
            }}
            title="クリックまたはスペースキーで表示を切り替え"
          >
            <AnimatedContent
              showOsaka={showOsaka}
              originalContent={
                <div className="text-lg leading-relaxed">
                  <div className="text-gray-800">
                    {articleData.originalText.map((paragraph, index) => (
                      <p key={index} className="mb-3" dangerouslySetInnerHTML={{ __html: paragraph }} />
                    ))}
                  </div>
                </div>
              }
              osakaContent={
                <div className="text-lg leading-relaxed">
                  <div className="text-gray-800" style={{ color: 'var(--primary-color)' }}>
                    {articleData.osakaText.map((paragraph, index) => (
                      <p key={index} className="mb-3">{highlightKeywords(paragraph)}</p>
                    ))}
                  </div>
                </div>
              }
            />
            
            {/* 条文用スピーカーボタン */}
            <div className="absolute bottom-4 right-4">
              <SpeakerButton 
                text={showOsaka ? articleData.osakaText.join('\n\n') : articleData.originalText.join('\n\n')}
                voice={showOsaka ? 'female' : 'male'}
              />
            </div>
          </div>

          {/* 解説 */}
          <div 
            className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-6 border-2 border-red-400 relative cursor-pointer select-none"
            onClick={(e) => {
              // スピーカーボタンがクリックされた場合は言語切り替えしない
              if ((e.target as HTMLElement).closest('button')) {
                return;
              }
              toggleViewMode();
            }}
            title="クリックまたはスペースキーで表示を切り替え"
          >
            {/* 解説アイコン */}
            <div className="absolute -top-4 left-6 bg-red-500 rounded-full w-8 h-8 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21V20H9V21Z" fill="#9CA3AF"/>
                <path d="M12 2C8.13401 2 5 5.13401 5 9C5 11.3869 6.33193 13.4617 8.27344 14.5547C8.27344 14.5547 9 15.5 9 17H15C15 15.5 15.7266 14.5547 15.7266 14.5547C17.6681 13.4617 19 11.3869 19 9C19 5.13401 15.866 2 12 2Z" fill="#FCD34D"/>
                <path d="M9 18H15V19H9V18Z" fill="#9CA3AF"/>
              </svg>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center">
                <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M3 12c0 4.418 4.03 8 9 8a9.863 9.863 0 004.255-.949L21 20l-1.395-3.72C20.488 15.042 21 13.574 21 12c0-4.418-4.03-8-9-8s-9 3.582-9 8z" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                ワンポイント解説
              </h3>
              <AnimatedContent
                showOsaka={showOsaka}
                originalContent={
                  <div className="leading-relaxed">
                    <div className="text-gray-700">
                      {articleData.commentary.map((paragraph, index) => (
                        <p key={index} className="mb-3">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                }
                osakaContent={
                  <div className="leading-relaxed">
                    <div className="text-gray-700" style={{ color: 'var(--primary-color)' }}>
                      {(articleData.commentaryOsaka || articleData.commentary).map((paragraph, index) => (
                        <p key={index} className="mb-3">{highlightKeywords(paragraph)}</p>
                      ))}
                    </div>
                  </div>
                }
              />
            </div>
            
            {/* 解説用スピーカーボタン */}
            <div className="absolute bottom-4 right-4">
              <SpeakerButton 
                text={showOsaka ? (articleData.commentaryOsaka || articleData.commentary).join('\n\n') : articleData.commentary.join('\n\n')}
                voice={showOsaka ? 'female' : 'male'}
              />
            </div>
          </div>

          {/* 操作説明 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">簡単操作</p>
            <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
              <span>🖱️ クリック、⌨️ スペースキー：言語の切り替え</span>
              <span>📱 スワイプ、⌨️ ← → キー：前後の条文へ</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  )
}