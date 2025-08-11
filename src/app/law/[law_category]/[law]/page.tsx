'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getLawName } from '@/lib/law-mappings'
import type { ArticleListItem } from '@/lib/types'

const LawArticlesPage = () => {
  const params = useParams<{ law_category: string; law: string }>();
  const { law_category, law } = params
  const [articles, setArticles] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const lawName = getLawName(law)

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
        if (result.data && Array.isArray(result.data)) {
          setArticles(result.data)
        } else if (Array.isArray(result)) {
          // 旧形式との互換性
          setArticles(result)
        } else {
          throw new Error('Invalid response format')
        }
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
      <div className="text-center text-primary text-xl">読み込み中...</div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl">
        エラーが発生しました: {error}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="text-center text-gray-600 text-xl">
        条文が見つかりませんでした。
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">{lawName}</h1>
      <div className="space-y-3">
        {articles.map(article => (
          <Link key={article.article} href={`/law/${law_category}/${law}/${article.article}`}>
            <div className="block p-4 bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow cursor-pointer">
              <span className="font-bold text-[#E94E77]">{`第${article.article}条`}</span>
              <span className="ml-4 text-gray-800"> {article.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default LawArticlesPage