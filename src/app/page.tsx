import { ShareButton } from '@/app/components/ShareButton';
import NostalgicCounter from '@/components/NostalgicCounter';
import { LawCardWithEeyan } from '@/app/components/LawCardWithEeyan';
import { lawsMetadata } from '@/data/lawsMetadata';

// カテゴリ別絵文字アイコンコンポーネント
const CategoryIcon = ({ icon }: { icon: string }) => {
  return <span className="text-2xl mr-2">{icon || '📄'}</span>;
};

export default function Home() {
  // lawsMetadataはビルド時に自動生成されるため、すでにyear/badgeが含まれている
  const categoriesWithMetadata = lawsMetadata.categories;

  return (
    <div className="relative">
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

      {/* カウンタエリア */}
      <div className="flex justify-center mb-8">
        <div className="text-center text-gray-500 text-sm flex items-center justify-center gap-1">
          <span>これまで</span>
          <NostalgicCounter counterId="osaka-kenpo-49a3907a" type="total" digits="4" />
          <span>人も見てくれてありがとなー</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center text-[#E94E77]">知りたい法律を選んでや</h1>
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
