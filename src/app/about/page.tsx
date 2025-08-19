import { ShareButton } from '../components/ShareButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'このサイトのこと - おおさかけんぽう',
}

export default function About() {
  return (
    <div className="min-h-screen bg-cream">
      {/* 右上にシェアボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton />
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
              
              <h3 className="text-lg font-semibold text-gray-700 mt-4">✅ 全部入り（全条文収録済み）</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>日本国憲法</strong> - 103条文</li>
                <li><strong>AI推進法</strong> - 28条文（附則含む）</li>
                <li><strong>十七条の憲法</strong> - 17条文</li>
                <li><strong>マグナ・カルタ</strong> - 46条文</li>
                <li><strong>南極条約</strong> - 14条文</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-gray-700 mt-4">🚧 ちょっとだけ（第1条のみ）</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>日本の法律：</strong> 民法、商法、刑法、民事訴訟法、刑事訴訟法ほか</li>
                <li><strong>日本の歴史法：</strong> 御成敗式目、武家諸法度、明治憲法ほか</li>
                <li><strong>外国の憲法：</strong> ドイツ基本法、アメリカ合衆国憲法、中華人民共和国憲法</li>
                <li><strong>外国の歴史法：</strong> ハンムラビ法典、ナポレオン法典</li>
                <li><strong>国際条約：</strong> 国連憲章、核兵器不拡散条約、宇宙条約ほか</li>
              </ul>
              
              <p className="text-sm text-gray-600 mt-4">
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
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-bold">📝 お約束ごと</p>
                <p className="mt-2">
                  このサイトを使うときは、みなさん自身で情報の正確性を確かめてもらうことをお願いしてるんや。
                  ここに載せてる翻訳や解説を参考にして何か決めはるときは、みなさんの責任で判断してもらうことになるで。
                </p>
                <p className="mt-3">
                  できるだけ正確な情報を提供するよう心がけてるけど、
                  このサイトの情報を使って起きた結果については、ごめんやけど責任を負うことはできひんのや。
                  法律のことで大事な判断をする時は、ちゃんと専門家はんに相談することをおすすめするで。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#E94E77] mb-4 border-b-2 border-[#E94E77] pb-2">
              💝 応援してもらえるとうれしいわ
            </h2>
            <div className="space-y-4 text-gray-800 leading-relaxed">
              <p>
                このサイトを作って運営していくには、サーバー代とか、メンテナンスとか、
                新しい法律を勉強する作業とか、いろんなところでお金と時間がかかるんやで。
              </p>
              <p>
                これからも日本の法律はもちろん、世界中の法律や歴史的な法律まで、
                どんどん追加していきたいと思ってるんやけど、正直なところ結構大変なんや。
              </p>
              <p>
                みなさんに応援してもらえたら、このサイトをずっと無料で使ってもらえるようにできるし、
                もっともっとたくさんの法律を大阪弁で紹介できるようになるでー！
              </p>
              <div className="mt-6 p-4 bg-[#FFF4F4] rounded-lg text-center">
                <p className="text-sm mb-3">
                  このサイトが役に立ったなぁ思ってもらえたら、<br />
                  応援してくれたら喜ぶ自信ある！
                </p>
                <a
                  href="https://github.com/sponsors/kako-jun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#E94E77] hover:bg-opacity-80 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  GitHub Sponsorsで応援するわ
                </a>
              </div>
              <div className="mt-4 p-4 bg-[#FFF8DC] rounded-lg text-center">
                <p className="text-sm mb-3">
                  英語やGitHubはようわからん、っちゅう人向けに<br />
                  Amazonアソシエイトでの支援もできるで。
                </p>
                <a
                  href="https://amzn.to/41dkZF1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#FF9900] hover:bg-opacity-80 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  よう使う電池でも買うてや
                </a>
                <p className="text-xs mt-2 text-gray-600">
                  電池ついでになんぼでも買うてくれてええんやけどな。<br />
                  猫のエサ代に化けるわ。
                </p>
              </div>
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