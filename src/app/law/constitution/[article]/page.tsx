'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface ArticleData {
  article: number
  title: string
  original: string
  osaka: string
  commentary: string
}

export default function ArticlePage() {
  const params = useParams()
  const [articleData, setArticleData] = useState<ArticleData | null>(null)
  const [showOsaka, setShowOsaka] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const response = await fetch(`/api/constitution/${params.article}`)
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

    if (params.article) {
      loadArticle()
    }
  }, [params.article])

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

  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            日本国憲法 {articleData.title}
          </h1>
          <nav className="flex justify-center space-x-4 text-sm">
            <a href="/" className="text-blue-600 hover:underline">トップ</a>
            <span className="text-gray-400">›</span>
            <span className="text-gray-600">憲法 第{articleData.article}条</span>
          </nav>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* 切り替えボタン */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg p-1 shadow-lg">
              <button
                onClick={() => setShowOsaka(false)}
                className={`px-6 py-2 rounded-md transition-colors ${
                  !showOsaka 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                原文
              </button>
              <button
                onClick={() => setShowOsaka(true)}
                className={`px-6 py-2 rounded-md transition-colors ${
                  showOsaka 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                大阪弁
              </button>
            </div>
          </div>

          {/* 条文表示 */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {articleData.title}
            </h2>
            <div className={`text-lg leading-relaxed ${
              showOsaka ? 'osaka-text text-primary' : 'text-gray-800'
            }`}>
              {showOsaka 
                ? articleData.osaka.split('\n').map((line, index) => (
                    <p key={index} className="mb-3">{line}</p>
                  ))
                : articleData.original.split('\n').map((line, index) => (
                    <p key={index} className="mb-3">{line}</p>
                  ))
              }
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