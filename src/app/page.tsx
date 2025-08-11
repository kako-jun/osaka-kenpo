import Link from 'next/link';
import lawsMetadata from '@/data/laws-metadata.json';
import { ShareButton } from '@/app/components/ShareButton';

export default function Home() {
  const lawCategories = lawsMetadata.categories.map(category => ({
    title: category.title,
    laws: category.laws
  }));

  return (
    <div className="relative">
      {/* 右上にシェアボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton 
          title="おおさかけんぽう - 法律を大阪弁で知ろう"
        />
      </div>
      {/* ロゴエリア（将来の画像用スケルトン） */}
      <div className="flex justify-center mb-8 mt-8">
        <div className="w-64 h-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-400">
            <div className="text-sm mb-1">ロゴ予定地</div>
            <div className="text-xs">264×128px</div>
          </div>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-6 text-center text-[#E94E77]">知りたい法律を選んでや</h1>
      <div className="space-y-8 mb-16">
        {lawCategories.map((category) => (
          <div key={category.title}>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#E94E77] pb-2">{category.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category.laws.sort((a, b) => a.year - b.year).map((law) => (
                law.status === 'available' ? (
                  <Link key={law.name} href={law.path} passHref className="block">
                    <div className="h-full flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl bg-[#E94E77] hover:bg-opacity-80 cursor-pointer">
                      <p className="mb-1">{law.name}</p>
                      {law.year && <p className="text-sm font-normal text-[#FFB6C1]">{law.year}年</p>}
                    </div>
                  </Link>
                ) : (
                  <div key={law.name} className="h-full flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl bg-gray-400 cursor-not-allowed relative">
                    <p className="mb-1">{law.name}</p>
                    {law.year && <p className="text-sm font-normal text-gray-300">{law.year}年</p>}
                    <span className="absolute bottom-2 right-2 text-xs font-normal bg-gray-500 px-2 py-1 rounded">準備中やで</span>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}