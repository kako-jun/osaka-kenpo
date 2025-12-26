import Link from 'next/link';
import { ShareButton } from '@/app/components/ShareButton';
import NostalgicCounter from '@/components/NostalgicCounter';
import { lawsMetadata } from '@/data/lawsMetadata';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

// カテゴリ別絵文字アイコンコンポーネント
const CategoryIcon = ({ icon }: { icon: string }) => {
  return <span className="text-2xl mr-2">{icon || '📄'}</span>;
};

// 法律メタデータを取得
async function getLawMetadataMap() {
  try {
    const db = getDB();
    const result = await db
      .prepare(
        `SELECT category, name, display_name, short_name, badge, year
         FROM laws`
      )
      .all();

    const metadataMap: Record<string, any> = {};
    for (const row of result.results as any[]) {
      const key = `${row.category}/${row.name}`;
      metadataMap[key] = {
        name: row.display_name,
        shortName: row.short_name,
        badge: row.badge,
        year: row.year,
      };
    }
    return metadataMap;
  } catch (error) {
    console.error('法律メタデータの取得に失敗:', error);
    return {};
  }
}

export default async function Home() {
  const lawMetadataMap = await getLawMetadataMap();

  // カテゴリにメタデータを結合
  const categoriesWithMetadata = lawsMetadata.categories.map((category) => {
    const lawsWithMetadata = category.laws.map((law) => {
      const pathParts = law.path.split('/');
      const lawCategory = pathParts[2];
      const lawId = pathParts[3];
      const key = `${lawCategory}/${lawId}`;

      const metadata = lawMetadataMap[key];

      return {
        ...law,
        name: metadata?.shortName || metadata?.name || law.id,
        year: metadata?.year || null,
        badge: metadata?.badge || null,
      };
    });

    return {
      ...category,
      laws: lawsWithMetadata,
    };
  });

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
                .sort((a: any, b: any) => (a.year || 0) - (b.year || 0))
                .map((law: any) =>
                  law.status === 'available' ? (
                    <Link key={law.id} href={law.path} passHref className="block">
                      <div className="h-32 flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl bg-[#E94E77] hover:bg-opacity-80 relative">
                        <p className="mb-1 mt-3">{law.name}</p>
                        {law.year && (
                          <p className="text-sm font-normal text-[#FFB6C1]">{law.year}年</p>
                        )}
                        {law.badge && (
                          <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white shadow-[0_0_8px_rgba(0,0,0,0.25)] bg-[#ed6b8a]">
                            {law.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={law.id}
                      className="h-32 flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl bg-gray-400 relative"
                    >
                      <p className="mb-1 mt-3">{law.name}</p>
                      {law.year && (
                        <p className="text-sm font-normal text-gray-300">{law.year}年</p>
                      )}
                      {law.badge && (
                        <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white shadow-[0_0_8px_rgba(0,0,0,0.25)] bg-[#ed6b8a]">
                          {law.badge}
                        </span>
                      )}
                      <span className="absolute bottom-2 right-2 text-xs font-normal bg-gray-500 px-2 py-1 rounded">
                        準備中やで
                      </span>
                    </div>
                  )
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
