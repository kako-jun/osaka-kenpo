import { ShareButton } from '../components/ShareButton'

export default function About() {
  return (
    <div className="min-h-screen bg-cream">
      {/* 右上にシェアボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton title="このサイトのこと - おおさかけんぽう" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-[#E94E77] mb-8">このサイトのこと</h1>

          <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#E94E77] mb-4 border-b-2 border-[#E94E77] pb-2">
              💡 おおさかけんぽう？
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed">
              <p>
                「おおさかけんぽう」は、難しい法律の条文を親しみやすい大阪弁で解説するウェブサイトやで。
              </p>
              <p>
                法律って、なんだかかたっ苦しうて読むんが大変やと思わへん？そんな法律への心理的なハードルを下げて、
                もっと気軽に法律に親しんでもらいたい、っちゅう思いで作ったんや。
              </p>
              <p>
                このサイトは『あずまんが大王』とは関係あらへんで。ただ、難しい言葉でも大阪弁やと異常に頭に入る法則があることを知ったんがきっかけやったんや。
                大阪弁の温かみのある表現で、法律の内容をわかりやすく説明してるんやで。
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#E94E77] mb-4 border-b-2 border-[#E94E77] pb-2">
              🎯 こんな人におすすめやで
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>法律に苦手意識を持ってはる人</li>
                <li>法律の勉強を始めたばっかりの学生はん</li>
                <li>大阪弁が好きな人</li>
                <li>かたい文章よりも親しみやすい表現で学びたい人</li>
                <li>法律をもっと身近に感じたい人</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#E94E77] mb-4 border-b-2 border-[#E94E77] pb-2">
              ✨ サイトのええとこ
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed">
              <h3 className="text-lg font-bold text-gray-700">🖱️ 簡単操作</h3>
              <p>条文や解説の部分をクリックするだけで、原文と大阪弁訳を簡単に切り替えられるんやで。
                 スペースキーでも切り替えできるさかい、キーボード操作もらくらくやで。</p>

              <h3 className="text-lg font-bold text-gray-700">🔊 音声読み上げ</h3>
              <p>各条文には音声読み上げ機能が付いてるんや。原文は男性の声、大阪弁訳は女性の声で、
                 聞いて学ぶこともできるんやで。</p>

              <h3 className="text-lg font-bold text-gray-700">📱 モバイル対応</h3>
              <p>スマートフォンやタブレットでも快適に読めるよう、レスポンシブデザインで作ってあるんやで。</p>

              <h3 className="text-lg font-bold text-gray-700">🔗 シェア機能</h3>
              <p>気に入った条文は、XやLINE、noteなんかのSNSで簡単にシェアできるで。</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#E94E77] mb-4 border-b-2 border-[#E94E77] pb-2">
              📚 何が入ってるん？
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed">
              <p>今んとこ、こんな法律・憲法を収録してるで：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>古の法・憲法：</strong> 十七条憲法</li>
                <li><strong>現行法：</strong> 準備中やで</li>
                <li><strong>国際条約：</strong> 準備中やで</li>
              </ul>
              <p className="text-sm text-gray-600">
                ※ これからもぼちぼち、いろんな法律や条例を追加していく予定やで。
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#E94E77] mb-4 border-b-2 border-[#E94E77] pb-2">
              ⚠️ 使うときの注意やで
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed">
              <p>
                このサイトの大阪弁訳は、法律の内容をもっと親しみやすく理解してもらうための
                参考資料として提供してるんやで。
              </p>
              <p>
                <strong>正式な法的効力を持つんは原文だけ</strong>やさかい、大事な判断をする時は
                必ず原文を確認するか、専門家はんに相談してな。
              </p>
              <p>
                翻訳の内容についてはこまかい注意を払ってるんやけど、解釈に違いがある場合は
                原文が優先されるで。
              </p>
            </div>
          </div>

          <div className="text-center">
            <a 
              href="/" 
              className="inline-block bg-[#E94E77] hover:bg-opacity-80 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              トップページに戻るで
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}