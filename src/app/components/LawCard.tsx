import Link from 'next/link';

interface LawCardProps {
  name: string;
  path: string;
  status: 'available' | 'preparing';
  year?: number | null;
  badge?: string | null;
}

export function LawCard({ name, path, status, year, badge }: LawCardProps) {
  const isAvailable = status === 'available';

  const card = (
    <div
      className={`h-32 flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl relative ${
        isAvailable ? 'bg-[#E94E77] hover:bg-opacity-80' : 'bg-gray-400'
      }`}
    >
      <p className="mb-1 mt-3">{name}</p>
      {year && (
        <p className={`text-sm font-normal ${isAvailable ? 'text-[#FFB6C1]' : 'text-gray-300'}`}>
          {year}年
        </p>
      )}
      {badge && (
        <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white shadow-[0_0_8px_rgba(0,0,0,0.25)] bg-[#ed6b8a]">
          {badge}
        </span>
      )}
      {!isAvailable && (
        <span className="absolute bottom-2 right-2 text-xs font-normal bg-gray-500 px-2 py-1 rounded">
          準備中やで
        </span>
      )}
    </div>
  );

  if (isAvailable) {
    return (
      <Link href={path} passHref className="block">
        {card}
      </Link>
    );
  }

  return card;
}
