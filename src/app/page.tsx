import { ShareButton } from '@/app/components/ShareButton';
import { TotalViewCounter } from '@/app/components/TotalViewCounter';
import { LawCardWithEeyan } from '@/app/components/LawCardWithEeyan';
import { lawsMetadata } from '@/data/lawsMetadata';
import { WebsiteStructuredData } from '@/components/StructuredData';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'おおさかけんぽう - 法律をおおさか弁で知ろう。知らんけど',
  description:
    'おおさかけんぽうは、法律の条文をおおさか弁で親しみやすく解説するサイト。六法、AI推進法、外国憲法、条約まで収録しています。',
  alternates: {
    canonical: '/',
  },
};

// カテゴリ別絵文字アイコンコンポーネント
const CategoryIcon = ({ icon }: { icon: string }) => {
  return <span className="text-2xl mr-2">{icon || '📄'}</span>;
};

export default function Home() {
  // lawsMetadataはビルド時に自動生成されるため、すでにyear/badgeが含まれている
  const categoriesWithMetadata = lawsMetadata.categories;

  return (
    <div className="relative">
      <WebsiteStructuredData description="法律の条文をおおさか弁で親しみやすく解説するサイト。六法、AI推進法、外国憲法、条約まで収録しています。" />
      <h1 className="sr-only">おおさかけんぽう</h1>

      {/* 右上にシェアボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton />
      </div>
      {/* ロゴエリア */}
      <div className="flex justify-center mb-1 mt-8">
        <img
          src="/osaka-kenpo-logo.webp"
          alt="おおさかけんぽう"
          className="w-[370px] h-[169px] object-contain"
        />
      </div>
      <div className="mb-6 text-center">
        <p className="text-base text-gray-700">法律をおおさか弁で知ろう。知らんけど</p>
      </div>

      {/* カウンタエリア */}
      <div className="flex justify-center mb-8">
        <div className="text-center text-gray-500 text-sm flex items-center justify-center gap-1">
          <span>これまで</span>
          <TotalViewCounter />
          <span>回も読んでくれてありがとなー</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center text-[#E94E77]">知りたい法律を選んでや</h2>
      <div className="space-y-8 mb-16">
        {categoriesWithMetadata.map((category) => (
          <div key={category.title}>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#E94E77] pb-2 flex items-center">
              <CategoryIcon icon={category.icon} />
              {category.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category.laws
                .sort((a, b) => (a.year || 0) - (b.year || 0))
                .map((law) => (
                  <LawCardWithEeyan key={law.id} law={law} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
