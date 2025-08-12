'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useViewMode } from '@/app/context/ViewModeContext'
import { ShareButton } from '@/app/components/ShareButton'
import { AnimatedContent } from '@/app/components/AnimatedContent'
import { KasugaLoading } from '@/app/components/KasugaLoading'
import type { ArticleListItem } from '@/lib/types'
import { loadLawBatchMetadata } from '@/lib/metadata_loader'
import type { LawMetadata } from '@/lib/schemas/law_metadata'
import type { FamousArticles } from '@/lib/schemas/famous_articles'
import type { ChaptersData } from '@/lib/schemas/chapters'

const LawArticlesPage = () => {
  const params = useParams<{ law_category: string; law: string }>();
  const { law_category, law } = params
  const { viewMode, setViewMode } = useViewMode()
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [famousArticles, setFamousArticles] = useState<FamousArticles | null>(null)
  const [lawSource, setLawSource] = useState<LawMetadata | null>(null)
  const [chaptersData, setChaptersData] = useState<ChaptersData | null>(null)
  const [lawName, setLawName] = useState<string>('')

  const showOsaka = viewMode === 'osaka'

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
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // 条文データとメタデータ類を並行取得
        const [articlesResponse, batchMetadata] = await Promise.all([
          fetch(`/api/${law_category}/${law}`),
          loadLawBatchMetadata(law_category, law)
        ])
        
        const { lawMetadata, famousArticles: famousArticlesData, chapters: chaptersData } = batchMetadata
        
        if (!articlesResponse.ok) {
          throw new Error(`HTTP error! status: ${articlesResponse.status}`)
        }
        const result = await articlesResponse.json()
        
        // 新しいAPIレスポンス形式 { data: ArticleListItem[] } に対応
        let articleList: ArticleListItem[] = []
        if (result.data && Array.isArray(result.data)) {
          articleList = result.data
        } else if (Array.isArray(result)) {
          // 旧形式との互換性
          articleList = result
        } else {
          throw new Error('Invalid response format')
        }
        
        setArticles(articleList)
        setFamousArticles(famousArticlesData)
        setLawSource(lawMetadata)
        setChaptersData(chaptersData)
        setLawName(lawMetadata?.shortName || lawMetadata?.name || law)
        
      } catch (e: any) {
        setError(e.message)
        console.error('Failed to fetch data:', e)
      } finally {
        setLoading(false)
      }
    }

    if (law_category && law) {
      fetchData()
    }
  }, [law_category, law])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <KasugaLoading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            エラーが発生しました: {error}
          </div>
          <a href="/" className="text-blue-600 hover:underline">
            トップページに戻る
          </a>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">
            条文が見つかりませんでした。
          </div>
          <a href="/" className="text-blue-600 hover:underline">
            トップページに戻る
          </a>
        </div>
      </div>
    )
  }

  // 章でグループ化する場合の処理
  const hasChapters = chaptersData !== null
  let groupedArticles: { [chapterKey: string]: { chapter: any, articles: ArticleListItem[] } } = {}
  
  if (hasChapters && chaptersData) {
    // 章ごとにグループ化
    chaptersData.chapters.forEach(chapter => {
      const chapterKey = String(chapter.chapter)
      groupedArticles[chapterKey] = {
        chapter,
        articles: articles.filter(article => 
          chapter.articles.some((chapterArticle: any) => 
            String(chapterArticle) === String(article.article)
          )
        )
      }
    })
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* 右上にシェアボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton 
          title={lawSource?.shortName || lawName}
        />
      </div>
      <div className="container mx-auto px-4 py-8">
        {lawSource && lawSource.shortName ? (
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#E94E77]">{lawSource.shortName}</h1>
            <p className="text-sm text-gray-600 mt-2">{lawSource.name}</p>
          </div>
        ) : (
          <h1 className="text-2xl font-bold mb-6 text-center text-[#E94E77]">{lawName}</h1>
        )}
        
        {/* 出典情報 */}
        {lawSource && (
          <div className="max-w-4xl mx-auto mb-8 bg-blue-50 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] p-6 border border-blue-100">
            <h2 className="text-lg font-bold text-gray-800 mb-3">📚 出典・参考資料</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>出典：</strong>{lawSource.source}</p>
              <p>{lawSource.description}</p>
              {lawSource.links && lawSource.links.length > 0 && (
                <div className="space-y-1">
                  <p><strong>参考リンク：</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    {lawSource.links.map((link, index) => (
                      <li key={index}>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
        {hasChapters ? (
          // 章構成がある場合：章ごとに表示
          Object.values(groupedArticles)
            .filter(group => group.articles.length > 0)
            .map(({ chapter, articles: chapterArticles }) => (
            <div key={chapter.chapter} className="mb-8">
              {/* 章のヘッダー */}
              <div className="mb-4">
                <AnimatedContent
                  showOsaka={showOsaka}
                  originalContent={
                    <h2 className="text-xl font-bold text-[#E94E77] border-b-2 border-[#E94E77] pb-2">
                      {chapter.title}
                    </h2>
                  }
                  osakaContent={
                    <h2 className="text-xl font-bold text-[#E94E77] border-b-2 border-[#E94E77] pb-2">
                      {chapter.titleOsaka}
                    </h2>
                  }
                />
                <AnimatedContent
                  showOsaka={showOsaka}
                  originalContent={
                    <p className="text-sm text-gray-600 mt-2">{chapter.description}</p>
                  }
                  osakaContent={
                    <p className="text-sm text-gray-600 mt-2">{chapter.descriptionOsaka || chapter.description}</p>
                  }
                />
              </div>
              
              {/* 章内の条文一覧 */}
              {chapterArticles.map(article => {
                const originalTitle = article.title
                const osakaTitle = article.titleOsaka || originalTitle
                
                // 有名な条文のバッジ情報を取得
                const famousArticleBadge = famousArticles?.[article.article.toString()]
                
                return (
                  <Link key={article.article} href={`/law/${law_category}/${law}/${article.article}`}>
                    <div 
                      className="block p-6 bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow cursor-pointer border-l-4 border-[#E94E77] mb-4 select-none relative"
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleViewMode()
                      }}
                      title="クリックまたはスペースキーで表示を切り替え"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-bold text-[#E94E77] text-lg mb-2 sm:mb-0 sm:mr-4">
                          {typeof article.article === 'number' ? `第${article.article}条` : (
                            article.article.startsWith('fusoku_') ? `附則第${article.article.replace('fusoku_', '')}条` : `第${article.article}条`
                          )}
                        </span>
                        {(originalTitle && originalTitle.trim() !== '') && (
                          <AnimatedContent
                            showOsaka={showOsaka}
                            originalContent={
                              <div className="text-gray-800 text-base leading-relaxed">
                                <span dangerouslySetInnerHTML={{ __html: originalTitle }} />
                              </div>
                            }
                            osakaContent={
                              <div className="text-gray-800 text-base leading-relaxed">
                                <span>{osakaTitle || originalTitle}</span>
                              </div>
                            }
                          />
                        )}
                      </div>
                      
                      {/* 有名な条文のバッジを右上に表示 */}
                      {famousArticleBadge && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white shadow-md bg-slate-500">
                          {famousArticleBadge}
                        </div>
                      )}
                      
                      {/* 右下にええやん数を表示 */}
                      <div className="absolute bottom-3 right-3 flex items-center space-x-1 text-xs text-gray-500">
                        <span className="font-bold text-[#E94E77]">
                          {Math.floor(Math.random() * 50)}
                        </span>
                        <span>ええやん</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ))
        ) : (
          // その他の法律の場合：従来通りの表示
          articles.map(article => {
            const originalTitle = article.title
            const osakaTitle = article.titleOsaka || originalTitle
            
            // 有名な条文のバッジ情報を取得
            const famousArticleBadge = famousArticles?.[article.article.toString()]
            
            return (
              <Link key={article.article} href={`/law/${law_category}/${law}/${article.article}`}>
                <div 
                  className="block p-6 bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow cursor-pointer border-l-4 border-[#E94E77] mb-4 select-none relative"
                  onDoubleClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleViewMode()
                  }}
                  title="クリックまたはスペースキーで表示を切り替え"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-bold text-[#E94E77] text-lg mb-2 sm:mb-0 sm:mr-4">
                      {typeof article.article === 'number' ? `第${article.article}条` : (
                        article.article.startsWith('fusoku_') ? `附則第${article.article.replace('fusoku_', '')}条` : `第${article.article}条`
                      )}
                    </span>
                    {(originalTitle && originalTitle.trim() !== '') && (
                      <AnimatedContent
                        showOsaka={showOsaka}
                        originalContent={
                          <div className="text-gray-800 text-base leading-relaxed">
                            <span dangerouslySetInnerHTML={{ __html: originalTitle }} />
                          </div>
                        }
                        osakaContent={
                          <div className="text-gray-800 text-base leading-relaxed">
                            <span>{osakaTitle || originalTitle}</span>
                          </div>
                        }
                      />
                    )}
                  </div>
                  
                  {/* 有名な条文のバッジを右上に表示 */}
                  {famousArticleBadge && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white shadow-md bg-slate-500">
                      {famousArticleBadge}
                    </div>
                  )}
                  
                  {/* 右下にええやん数を表示 */}
                  <div className="absolute bottom-3 right-3 flex items-center space-x-1 text-xs text-gray-500">
                    <span className="font-bold text-[#E94E77]">
                      {Math.floor(Math.random() * 50)}
                    </span>
                    <span>ええやん</span>
                  </div>
                </div>
              </Link>
            )
          })
        )}

        {/* 操作説明 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">簡単操作</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <span>⌨️ スペースキー：言語の切り替え</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default LawArticlesPage