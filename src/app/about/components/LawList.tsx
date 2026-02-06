import { memo } from 'react';

interface LawListProps {
  title: string;
  emoji: string;
  items: Array<{
    name: string;
    articles?: string;
  }>;
}

export const LawList = memo(function LawList({ title, emoji, items }: LawListProps) {
  return (
    <>
      <h3 className="text-lg font-semibold text-gray-700 mt-4">
        {emoji} {title}
      </h3>
      <ul className="list-disc list-inside space-y-2 ml-4">
        {items.map((item, index) => (
          <li key={index}>
            <strong>{item.name}</strong>
            {item.articles && ` - ${item.articles}`}
          </li>
        ))}
      </ul>
    </>
  );
});
