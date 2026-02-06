import Link from 'next/link';
import type { CategoryEntry } from '@/data/lawsMetadata';

interface MenuCategoryProps {
  category: CategoryEntry;
  onLinkClick: () => void;
}

export function MenuCategory({ category, onLinkClick }: MenuCategoryProps) {
  return (
    <div key={category.id} className="space-y-1">
      <div className="flex items-center gap-2 px-3 py-2 bg-black/15 rounded-lg mb-2">
        <span className="text-lg">{category.icon || '📄'}</span>
        <span className="font-bold text-sm">{category.title}</span>
      </div>
      {[...category.laws]
        .sort((a, b) => (a.year || 0) - (b.year || 0))
        .map((law) => {
          const isAvailable = law.status === 'available';
          const lawName = law.shortName || law.id;

          if (isAvailable) {
            return (
              <Link
                key={law.path}
                href={law.path}
                onClick={onLinkClick}
                className="flex items-center pl-3 pr-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                {law.year && (
                  <span className="text-white/50 text-xs w-12 shrink-0">{law.year}</span>
                )}
                <span>{lawName}</span>
              </Link>
            );
          } else {
            return (
              <div
                key={law.path}
                className="flex items-center pl-3 pr-3 py-2 text-sm cursor-default"
              >
                {law.year && (
                  <span className="text-white/30 text-xs w-12 shrink-0">{law.year}</span>
                )}
                <span className="text-white/40">{lawName}</span>
              </div>
            );
          }
        })}
    </div>
  );
}
