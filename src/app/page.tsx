import Link from 'next/link';
import lawsMetadata from '@/data/laws-metadata.json';
import { ShareButton } from './components/ShareButton';

export default function Home() {
  const lawCategories = lawsMetadata.categories.map(category => ({
    title: category.title,
    laws: category.laws
  }));

  return (
    <div className="relative">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#E94E77] mt-8">知りたい法律を選んでや</h1>
      
      {/* 右上にシェアボタン */}
      <div className="absolute top-0 right-0">
        <ShareButton 
          title="おおさかけんぽう - 法律を大阪弁で知ろう"
        />
      </div>
      <div className="space-y-8">
        {lawCategories.map((category) => (
          <div key={category.title}>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#E94E77] pb-2">{category.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category.laws.sort((a, b) => a.year - b.year).map((law) => (
                <Link key={law.name} href={law.path} passHref className="block">
                  <div
                    className={`h-full flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl ${
                      law.status === 'available'
                        ? 'bg-[#E94E77] hover:bg-opacity-80 cursor-pointer'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <p>{law.name}</p>
                    {law.year && <p className="text-sm font-normal text-[#FFB6C1]">{law.year}年</p>}
                    {law.status === 'preparing' && <span className="text-sm block mt-1 font-normal">（準備中）</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}