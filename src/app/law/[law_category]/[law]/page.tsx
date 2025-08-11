'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLawName } from '@/lib/law-mappings'
import { useViewMode } from '../../../context/ViewModeContext'
import { ShareButton } from '../../../components/ShareButton'
import { AnimatedContent } from '../../../components/AnimatedContent'
import type { ArticleListItem, ArticleData } from '@/lib/types'
import lawSources from '@/data/law-sources.json'
import constitutionChapters from '@/data/constitution-chapters.json'

const LawArticlesPage = () => {
  const params = useParams<{ law_category: string; law: string }>();
  const { law_category, law } = params
  const { viewMode, setViewMode } = useViewMode()
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [articlesData, setArticlesData] = useState<ArticleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const lawName = getLawName(law)
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
    const fetchArticles = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/${law_category}/${law}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        
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
        
        // 各条文の詳細データを取得
        const detailPromises = articleList.map(async (article) => {
          try {
            const detailResponse = await fetch(`/api/${law_category}/${law}/${article.article}`)
            if (detailResponse.ok) {
              const detailResult = await detailResponse.json()
              return detailResult.data || detailResult
            }
          } catch (e) {
            console.error(`Failed to fetch article ${article.article}:`, e)
          }
          return null
        })
        
        const articlesDetails = await Promise.all(detailPromises)
        setArticlesData(articlesDetails.filter(Boolean))
        
      } catch (e: any) {
        setError(e.message)
        console.error('Failed to fetch articles:', e)
      } finally {
        setLoading(false)
      }
    }

    if (law_category && law) {
      fetchArticles()
    }
  }, [law_category, law])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center text-primary text-xl">読み込み中...</div>
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

  const lawSource = lawSources.sources[law as keyof typeof lawSources.sources]
  
  // 日本国憲法の場合は章でグループ化
  const isConstitution = law === 'constitution'
  let groupedArticles: { [chapterNumber: number]: { chapter: any, articles: ArticleListItem[] } } = {}
  
  if (isConstitution) {
    // 章ごとにグループ化
    constitutionChapters.chapters.forEach(chapter => {
      groupedArticles[chapter.chapter] = {
        chapter,
        articles: articles.filter(article => 
          chapter.articles.includes(Number(article.article))
        )
      }
    })
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* 右上にシェアボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton 
          title={lawName}
        />
      </div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#E94E77]">{lawName}</h1>
        
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
        {isConstitution ? (
          // 日本国憲法の場合：章ごとに表示
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
                      第{chapter.chapter}章　{chapter.title}
                    </h2>
                  }
                  osakaContent={
                    <h2 className="text-xl font-bold text-[#E94E77] border-b-2 border-[#E94E77] pb-2">
                      第{chapter.chapter}章　{chapter.titleOsaka}
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
                const articleDetail = articlesData.find(detail => detail?.article === Number(article.article))
                const originalTitle = articleDetail?.title !== undefined ? articleDetail.title : article.title
                const osakaTitle = articleDetail?.titleOsaka !== undefined ? articleDetail.titleOsaka : originalTitle
                
                return (
                  <Link key={article.article} href={`/law/${law_category}/${law}/${article.article}`}>
                    <div 
                      className="block p-6 bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow cursor-pointer border-l-4 border-[#E94E77] mb-4 select-none"
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleViewMode()
                      }}
                      title="ダブルクリックまたはスペースキーで表示を切り替え"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-bold text-[#E94E77] text-lg mb-2 sm:mb-0 sm:mr-4">{`第${article.article}条`}</span>
{(originalTitle || osakaTitle) && (
                          <AnimatedContent
                            showOsaka={showOsaka}
                            originalContent={
                              <div className="text-gray-800 text-base leading-relaxed">
                                {originalTitle && <span dangerouslySetInnerHTML={{ __html: originalTitle }} />}
                              </div>
                            }
                            osakaContent={
                              <div className="text-gray-800 text-base leading-relaxed">
                                {osakaTitle && <span>{osakaTitle}</span>}
                              </div>
                            }
                          />
                        )}
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
            const articleDetail = articlesData.find(detail => detail?.article === Number(article.article))
            const originalTitle = articleDetail?.title !== undefined ? articleDetail.title : article.title
            const osakaTitle = articleDetail?.titleOsaka !== undefined ? articleDetail.titleOsaka : originalTitle
            
            return (
              <Link key={article.article} href={`/law/${law_category}/${law}/${article.article}`}>
                <div 
                  className="block p-6 bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow cursor-pointer border-l-4 border-[#E94E77] mb-4 select-none"
                  onDoubleClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleViewMode()
                  }}
                  title="ダブルクリックまたはスペースキーで表示を切り替え"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-bold text-[#E94E77] text-lg mb-2 sm:mb-0 sm:mr-4">{`第${article.article}条`}</span>
{(originalTitle || osakaTitle) && (
                      <AnimatedContent
                        showOsaka={showOsaka}
                        originalContent={
                          <div className="text-gray-800 text-base leading-relaxed">
                            {originalTitle && <span dangerouslySetInnerHTML={{ __html: originalTitle }} />}
                          </div>
                        }
                        osakaContent={
                          <div className="text-gray-800 text-base leading-relaxed">
                            {osakaTitle && <span>{osakaTitle}</span>}
                          </div>
                        }
                      />
                    )}
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