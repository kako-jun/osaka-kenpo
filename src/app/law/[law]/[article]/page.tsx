'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useViewMode } from '../../../context/ViewModeContext'

interface ArticleData {
  article: number
  title: string
  original: string
  osaka: string
  commentary: string
}

export default function ArticlePage() {
  const params = useParams<{ law: string; article: string }>()
  const { viewMode } = useViewMode(); // Global state
  const [articleData, setArticleData] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)

  const lawNameMapping: { [key: string]: string } = {
    constitution: '日本国憲法',
    minpou: '民法',
    keihou: '刑法',
    shouhou: '商法',
  };
  const lawName = lawNameMapping[params.law] || '不明な法律';

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const response = await fetch(`/api/${params.law}/${params.article}`)
        if (response.ok) {
          const data = await response.json()
          setArticleData(data)
        }
      } catch (error) {
        console.error('Failed to load article:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.law && params.article) {
      loadArticle()
    }
  }, [params.law, params.article])

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
        <header className="text-center mb-4">
          <nav className="flex justify-center space-x-4 text-sm mb-2">
            <a href="/" className="text-blue-600 hover:underline">トップ</a>
            <span className="text-gray-400">›</span>
            <a href={`/law/${params.law}`} className="text-blue-600 hover:underline">{lawName}</a>
            <span className="text-gray-400">›</span>
            <span className="text-gray-600">第{articleData.article}条</span>
          </nav>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {lawName} {articleData.title}
          </h1>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* 条文表示 */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {articleData.title}
            </h2>
            <div className={`text-lg leading-relaxed ${
              showOsaka ? 'osaka-text text-primary' : 'text-gray-800'
            }`}>
              {(showOsaka ? articleData.osaka : articleData.original).split('\n').map((line, index) => (
                <p key={index} className="mb-3">{line}</p>
              ))}
            </div>
          </div>

          {/* 解説 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-primary mb-3">
              ワンポイント解説
            </h3>
            <p className="text-gray-700 leading-relaxed osaka-text">
              {articleData.commentary}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}