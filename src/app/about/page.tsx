import { ShareButton } from '../components/ShareButton'

export default function About() {
  return (
    <div className="min-h-screen bg-cream">
      {/* 右上にシェアボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton title="このサイトについて - おおさかけんぽう" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-[#E94E77] mb-8">このサイトについて</h1>

          <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#E94E77] mb-4 border-b-2 border-[#E94E77] pb-2">
              💡 おおさかけんぽうとは
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed">
              <p>
                「おおさかけんぽう」は、難しい法律の条文を親しみやすい大阪弁で解説するウェブサイトです。
              </p>
              <p>
                法律って、なんだか堅苦しくて読むのが大変やと思いませんか？そんな法律への心理的なハードルを下げて、
                もっと気軽に法律に親しんでもらいたい、という思いで作りました。
              </p>
              <p>
                大阪弁の温かみのある表現で、法律の内容を分かりやすく説明しています。
                まるで春日歩さん（あずまんが大王の大阪さん）が法律について教えてくれるような、
                そんな親しみやすいサイトを目指しています。
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#E94E77] mb-4 border-b-2 border-[#E94E77] pb-2">
              🎯 こんな方におすすめ
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>法律に苦手意識を持つ方</li>
                <li>法律の勉強を始めたばかりの学生さん</li>
                <li>大阪弁が好きな方</li>
                <li>堅い文章よりも親しみやすい表現で学びたい方</li>
                <li>法律をもっと身近に感じたい方</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#E94E77] mb-4 border-b-2 border-[#E94E77] pb-2">
              ✨ サイトの特徴
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed">
              <h3 className="text-lg font-bold text-gray-700">🖱️ 簡単操作</h3>
              <p>条文や解説の部分をクリックするだけで、原文と大阪弁訳を簡単に切り替えられます。
                 スペースキーでも切り替えできるので、キーボード操作も楽々です。</p>

              <h3 className="text-lg font-bold text-gray-700">🔊 音声読み上げ</h3>
              <p>各条文には音声読み上げ機能が付いています。原文は男性の声、大阪弁訳は女性の声で、
                 聞いて学ぶこともできます。</p>

              <h3 className="text-lg font-bold text-gray-700">📱 モバイル対応</h3>
              <p>スマートフォンやタブレットでも快適に読めるよう、レスポンシブデザインで作られています。</p>

              <h3 className="text-lg font-bold text-gray-700">🔗 シェア機能</h3>
              <p>気に入った条文は、X（Twitter）やLINE、noteなどのSNSで簡単にシェアできます。</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#E94E77] mb-4 border-b-2 border-[#E94E77] pb-2">
              📚 収録内容
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed">
              <p>現在、以下の法律・憲法を収録しています：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>古の法・憲法：</strong> 十七条憲法</li>
                <li><strong>現行法：</strong> 準備中</li>
                <li><strong>国際条約：</strong> 準備中</li>
              </ul>
              <p className="text-sm text-gray-600">
                ※ 今後も順次、様々な法律や条例を追加していく予定です。
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#E94E77] mb-4 border-b-2 border-[#E94E77] pb-2">
              ⚠️ ご利用にあたって
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed">
              <p>
                このサイトの大阪弁訳は、法律の内容をより親しみやすく理解していただくための
                参考資料として提供しています。
              </p>
              <p>
                <strong>正式な法的効力を持つのは原文のみ</strong>であり、重要な判断を行う際は
                必ず原文をご確認いただくか、専門家にご相談ください。
              </p>
              <p>
                翻訳の内容については細心の注意を払っていますが、解釈に相違がある場合は
                原文が優先されます。
              </p>
            </div>
          </div>

          <div className="text-center">
            <a 
              href="/" 
              className="inline-block bg-[#E94E77] hover:bg-opacity-80 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              トップページに戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}