'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LAW_CATEGORIES } from '@/lib/types'
import type { LawInfo } from '@/lib/types'

const LawCategoryPage = () => {
  const params = useParams<{ law_category: string }>()
  const { law_category } = params
  const [laws, setLaws] = useState<LawInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categoryTitle = LAW_CATEGORIES[law_category as keyof typeof LAW_CATEGORIES] || '法律カテゴリ'

  useEffect(() => {
    const fetchLaws = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/${law_category}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        
        // 新しいAPIレスポンス形式に対応
        if (result.data && Array.isArray(result.data)) {
          setLaws(result.data)
        } else if (Array.isArray(result)) {
          // 旧形式との互換性
          setLaws(result)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (e: any) {
        setError(e.message)
        console.error('Failed to fetch laws:', e)
      } finally {
        setLoading(false)
      }
    }

    if (law_category) {
      fetchLaws()
    }
  }, [law_category])

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

  if (laws.length === 0) {
    return (
      <div className="text-center text-gray-600 text-xl">
        法律が見つかりませんでした。
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">{categoryTitle}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {laws.map(law => (
          <Link key={law.slug} href={`/law/${law_category}/${law.slug}`} passHref className="block">
            <div
              className="h-full flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl bg-[#E94E77] hover:bg-opacity-80 cursor-pointer"
            >
              <p>{law.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default LawCategoryPage
