export default function Home() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            おおさかけんぽう
          </h1>
          <p className="text-lg text-brown">
            法律を大阪弁で親しみやすく解説するサイト
          </p>
        </header>
        
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">
            日本国憲法
          </h2>
          <p className="text-gray-700 mb-4">
            難しい法律の条文を、大阪のおばちゃんが喋るような親しみやすい言葉で解説します。
          </p>
          <div className="space-y-2">
            <a href="/law/constitution/1" className="block p-3 bg-primary text-white rounded hover:bg-pink-600 transition-colors">
              第1条を見る
            </a>
            <a href="/law/constitution/9" className="block p-3 bg-primary text-white rounded hover:bg-pink-600 transition-colors">
              第9条を見る
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}