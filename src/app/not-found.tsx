'use client'

import Link from 'next/link'
import { ShareButton } from '@/app/components/ShareButton'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center px-4 py-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-[#E94E77] mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ページが見つからへん
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            すんません、探しはるページは見つからんかったわ。
            <br />
            もしかして法律の条文をお探しですかいな？
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="bg-[#E94E77] hover:bg-[#d63d6b] text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors"
          >
            トップページに戻る
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors"
          >
            前のページに戻る
          </button>
        </div>
      </div>
    </div>
  )
}