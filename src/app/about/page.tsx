import { ShareButton } from '../components/ShareButton';
import { ContentSection } from '../components/ContentSection';
import { Button } from '@/components/Button';
import { SponsorSection } from './components/SponsorSection';
import { FeatureItem } from './components/FeatureItem';
import { LawList } from './components/LawList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'このサイトのこと - おおさかけんぽう',
};

export default function About() {
  return (
    <div className="min-h-screen bg-cream">
      {/* 右上にシェアボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-center text-[#E94E77] mb-8">このサイトのこと</h1>

          <ContentSection title="💡 おおさかけんぽう？">
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
          </ContentSection>

          <ContentSection title="🎯 こんな人におすすめやで">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>法律に苦手意識を持ってはる人</li>
              <li>法律の勉強を始めたばっかりの学生はん</li>
              <li>大阪弁が好きな人</li>
              <li>かたい文章よりも親しみやすい表現で学びたい人</li>
              <li>法律をもっと身近に感じたい人</li>
            </ul>
          </ContentSection>

          <ContentSection title="✨ サイトのええとこ">
            <FeatureItem
              icon="🖱️"
              title="簡単操作"
              description="条文や解説の部分をクリックするだけで、原文と大阪弁訳を簡単に切り替えられるんやで。スペースキーでも切り替えできるさかい、キーボード操作もらくらくやで。"
            />

            <FeatureItem
              icon="🔊"
              title="音声読み上げ"
              description="各条文には音声読み上げ機能が付いてるんや。原文は男性の声、大阪弁訳は女性の声で、聞いて学ぶこともできるんやで。"
            />

            <FeatureItem
              icon="📱"
              title="モバイル対応"
              description="スマートフォンやタブレットでも快適に読めるよう、レスポンシブデザインで作ってあるんやで。"
            />

            <FeatureItem
              icon="🔗"
              title="シェア機能"
              description="気に入った条文は、XやLINE、noteなんかのSNSで簡単にシェアできるで。"
            />
          </ContentSection>

          <ContentSection title="📚 何が入ってるん？">
            <p>今んとこ、こんな法律・憲法を収録してるで：</p>

            <LawList
              title="全部入り（全条文収録済み）"
              emoji="✅"
              items={[
                { name: '日本国憲法', articles: '103条文' },
                { name: 'AI推進法', articles: '28条文（附則含む）' },
                { name: '十七条の憲法', articles: '17条文' },
                { name: 'マグナ・カルタ', articles: '46条文' },
                { name: '南極条約', articles: '14条文' },
              ]}
            />

            <LawList
              title="ちょっとだけ（第1条のみ）"
              emoji="🚧"
              items={[
                { name: '日本の法律：', articles: '民法、商法、刑法、民事訴訟法、刑事訴訟法ほか' },
                { name: '日本の歴史法：', articles: '御成敗式目、武家諸法度、明治憲法ほか' },
                {
                  name: '外国の憲法：',
                  articles: 'ドイツ基本法、アメリカ合衆国憲法、中華人民共和国憲法',
                },
                { name: '外国の歴史法：', articles: 'ハンムラビ法典、ナポレオン法典' },
                { name: '国際条約：', articles: '国連憲章、核兵器不拡散条約、宇宙条約ほか' },
              ]}
            />

            <p className="text-sm text-gray-600 mt-4">
              ※ これからもぼちぼち、いろんな法律や条例を追加していく予定やで。
            </p>
          </ContentSection>

          <ContentSection title="⚠️ 使うときの注意やで">
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
          </ContentSection>

          <ContentSection title="💝 応援してもらえるとうれしいわ">
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
            <SponsorSection
              description="このサイトが役に立ったなぁ思ってもらえたら、<br />応援してくれたら喜ぶ自信ある！"
              buttonText="GitHub Sponsorsで応援するわ"
              buttonUrl="https://github.com/sponsors/kako-jun"
              variant="primary"
            />
            <SponsorSection
              description="英語やGitHubはようわからん、っちゅう人向けに<br />Amazonアソシエイトでの支援もできるで。"
              buttonText="よう使う電池でも買うてや"
              buttonUrl="https://amzn.to/41dkZF1"
              variant="amazon"
              note="電池ついでになんぼでも買うてくれてええんやけどな。<br />猫のエサ代に化けるわ。"
            />
          </ContentSection>

          <div className="text-center">
            <Button as="link" href="/" variant="primary" size="lg">
              トップページに戻るで
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
