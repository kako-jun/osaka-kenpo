'use client'

import Link from 'next/link';
import { ShareButton } from '@/app/components/ShareButton';
import { KasugaLoading } from '@/app/components/KasugaLoading';
import { useState, useEffect } from 'react';
import { loadBatchMetadata } from '@/lib/metadata_loader';

// カテゴリ別絵文字アイコンコンポーネント
const CategoryIcon = ({ icon }: { icon: string }) => {
  return <span className="text-2xl mr-2">{icon || '📄'}</span>;
};

export default function Home() {
  const [lawCategories, setLawCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllMetadata = async () => {
      try {
        const { lawsMetadata, lawMetadata } = await loadBatchMetadata();
        
        if (!lawsMetadata) {
          setLoading(false);
          return;
        }

        const categoriesWithMetadata = lawsMetadata.categories.map((category) => {
          const lawsWithMetadata = category.laws.map((law) => {
            const pathParts = law.path.split('/');
            const lawCategory = pathParts[2];
            const lawId = pathParts[3];
            const key = `${lawCategory}/${lawId}`;
            
            const metadata = lawMetadata[key];
            
            return {
              ...law,
              name: metadata?.shortName || metadata?.name || law.id,
              year: metadata?.year || null,
              badge: metadata?.badge || null
            };
          });
          
          return {
            ...category,
            laws: lawsWithMetadata
          };
        });
        
        setLawCategories(categoriesWithMetadata);
        setLoading(false);
      } catch (error) {
        console.error('メタデータ読み込みエラー:', error);
        setLoading(false);
      }
    };

    loadAllMetadata();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <KasugaLoading />
      </div>
    );
  }

  if (lawCategories.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            法律データが読み込めませんでした
          </div>
          <div className="text-gray-600 text-sm">
            ブラウザのコンソールでエラーを確認してください
          </div>
        </div>
      </div>
    );
  }

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
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#E94E77] pb-2 flex items-center">
              <CategoryIcon icon={category.icon} />
              {category.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category.laws.sort((a, b) => (a.year || 0) - (b.year || 0)).map((law) => (
                law.status === 'available' ? (
                  <Link key={law.id} href={law.path} passHref className="block">
                    <div className="h-32 flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl bg-[#E94E77] hover:bg-opacity-80 cursor-pointer relative">
                      <p className="mb-1 mt-3">{law.name}</p>
                      {law.year && <p className="text-sm font-normal text-[#FFB6C1]">{law.year}年</p>}
                      {law.badge && (
                        <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white shadow-[0_0_8px_rgba(0,0,0,0.25)] bg-[#ed6b8a]">
                          {law.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div key={law.id} className="h-32 flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl bg-gray-400 cursor-not-allowed relative">
                    <p className="mb-1 mt-3">{law.name}</p>
                    {law.year && <p className="text-sm font-normal text-gray-300">{law.year}年</p>}
                    {law.badge && (
                      <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white shadow-[0_0_8px_rgba(0,0,0,0.25)] bg-[#ed6b8a]">
                        {law.badge}
                      </span>
                    )}
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