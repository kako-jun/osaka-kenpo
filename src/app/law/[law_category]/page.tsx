import Link from 'next/link';
import { lawsMetadata } from '@/data/lawsMetadata';
import { LAW_CATEGORIES } from '@/lib/types';

export const runtime = 'edge';

export default async function LawCategoryPage({
  params,
}: {
  params: Promise<{ law_category: string }>;
}) {
  const { law_category } = await params;
  const categoryTitle =
    LAW_CATEGORIES[law_category as keyof typeof LAW_CATEGORIES] || '法律カテゴリ';

  // 静的メタデータからカテゴリに属する法律を取得
  const laws = lawsMetadata.categories
    .flatMap((c) => c.laws)
    .filter((law) => law.path.startsWith(`/law/${law_category}/`));

  if (laws.length === 0) {
    return <div className="text-center text-gray-600 text-xl">法律が見つかりませんでした。</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-center text-[#E94E77]">{categoryTitle}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {laws.map((law) => (
          <Link key={law.id} href={law.path} passHref className="block">
            <div className="h-full flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl bg-[#E94E77] hover:bg-opacity-80 cursor-pointer">
              <p>{law.shortName}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
