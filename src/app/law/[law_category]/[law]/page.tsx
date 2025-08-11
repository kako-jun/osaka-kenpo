'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLawName } from '@/lib/law-mappings'
import { useViewMode } from '../../../context/ViewModeContext'
import { ShareButton } from '../../../components/ShareButton'
import type { ArticleListItem, ArticleData } from '@/lib/types'
import lawSources from '@/data/law-sources.json'

const LawArticlesPage = () => {
  const params = useParams<{ law_category: string; law: string }>();
  const { law_category, law } = params
  const { viewMode } = useViewMode()
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [articlesData, setArticlesData] = useState<ArticleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const lawName = getLawName(law)
  const showOsaka = viewMode === 'osaka'

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

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8 relative">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#E94E77]">{lawName}</h1>
        
        {/* 右上にシェアボタン */}
        <div className="absolute top-8 right-4">
          <ShareButton 
            title={`${lawName} - おおさかけんぽう`}
          />
        </div>
        
        {/* 出典情報 */}
        {lawSource && (
          <div className="max-w-4xl mx-auto mb-8 bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] p-6">
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
        {articles.map(article => {
          const articleDetail = articlesData.find(detail => detail?.article === Number(article.article))
          const displayTitle = showOsaka && articleDetail?.titleOsaka 
            ? articleDetail.titleOsaka 
            : (articleDetail?.title || article.title)
          
          return (
            <Link key={article.article} href={`/law/${law_category}/${law}/${article.article}`}>
              <div className="block p-6 bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow cursor-pointer border-l-4 border-[#E94E77] mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="font-bold text-[#E94E77] text-lg mb-2 sm:mb-0 sm:mr-4">{`第${article.article}条`}</span>
                  <div className="text-gray-800 text-base leading-relaxed">
                    {showOsaka ? (
                      <span>{displayTitle}</span>
                    ) : (
                      <span dangerouslySetInnerHTML={{ __html: displayTitle }} />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
        </div>
      </div>
    </div>
  )
}

export default LawArticlesPage