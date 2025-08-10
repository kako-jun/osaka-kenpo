'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useViewMode } from '../../../../context/ViewModeContext'

interface ArticleData {
  article: number
  title: string
  original: string
  osaka: string
  commentary: string
}

export default function ArticlePage() {
  const params = useParams<{ law_category: string; law: string; article: string }>()
  const { viewMode } = useViewMode(); // Global state
  const [articleData, setArticleData] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)

  const lawNameMapping: { [key: string]: string } = {
    constitution: '日本国憲法',
    minpou: '民法',
    keihou: '刑法',
    shouhou: '商法',
    minji_soshou_hou: '民事訴訟法',
    keiji_soshou_hou: '刑事訴訟法',
    taiho_ritsuryo: '大宝律令',
    goseibai_shikimoku: '御成敗式目',
    buke_shohatto: '武家諸法度',
    kinchu_kuge_shohatto: '禁中並公家諸法度',
    jushichijo_kenpo: '十七条の憲法',
    meiji_kenpo: '大日本帝国憲法',
    hammurabi_code: 'ハンムラビ法典',
    magna_carta: 'マグナ・カルタ',
    german_basic_law: 'ドイツ基本法',
    napoleonic_code: 'ナポレオン法典',
    us_constitution: 'アメリカ合衆国憲法',
    prc_constitution: '中華人民共和国憲法',
    antarctic_treaty: '南極条約',
    ramsar_convention: 'ラムサール条約',
    un_charter: '国際連合憲章',
    npt: '核拡散防止条約',
    outer_space_treaty: '宇宙条約',
    universal_postal_convention: '万国郵便条約',
    olympic_charter: 'オリンピック憲章',
    extradition_treaty: '犯罪人引渡し条約',
  };
  const lawName = lawNameMapping[params.law] || '不明な法律';

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const response = await fetch(`/api/${params.law_category}/${params.law}/${params.article}`)
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
        <header className="text-center mb-4">
          <nav className="flex justify-center space-x-4 text-sm mb-2">
            <a href="/" className="text-blue-600 hover:underline">トップ</a>
            <span className="text-gray-400">›</span>
            <a href={`/law/${params.law_category}/${params.law}`} className="text-blue-600 hover:underline">{lawName}</a>
            <span className="text-gray-400">›</span>
            <span className="text-gray-600">第{articleData.article}条</span>
          </nav>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {lawName} {articleData.title}
          </h1>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* 条文表示 */}
          <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-6">
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
          <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-6">
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