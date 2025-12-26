import Link from 'next/link';
import { getDB } from '@/lib/db';
import { LAW_CATEGORIES } from '@/lib/types';

export const runtime = 'edge';

// 法律一覧を取得
async function getLawsByCategory(category: string) {
  try {
    const db = getDB();
    const result = await db
      .prepare(
        `SELECT name, display_name, short_name
         FROM laws
         WHERE category = ?
         ORDER BY name`
      )
      .bind(category)
      .all();
    return result.results as any[];
  } catch (error) {
    console.error('法律一覧の取得に失敗:', error);
    return [];
  }
}

export default async function LawCategoryPage({
  params,
}: {
  params: Promise<{ law_category: string }>;
}) {
  const { law_category } = await params;
  const categoryTitle =
    LAW_CATEGORIES[law_category as keyof typeof LAW_CATEGORIES] || '法律カテゴリ';

  const laws = await getLawsByCategory(law_category);

  if (laws.length === 0) {
    return <div className="text-center text-gray-600 text-xl">法律が見つかりませんでした。</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-center text-[#E94E77]">{categoryTitle}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {laws.map((law) => (
          <Link key={law.name} href={`/law/${law_category}/${law.name}`} passHref className="block">
            <div className="h-full flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl bg-[#E94E77] hover:bg-opacity-80 cursor-pointer">
              <p>{law.short_name || law.display_name || law.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
