import Link from 'next/link';
import { AnimatedContent } from '@/app/components/AnimatedContent';
import { formatArticleNumber } from '@/lib/utils';

interface ArticleHeaderProps {
  lawCategory: string;
  law: string;
  lawName: string;
  article: string | number;
  title: string;
  titleOsaka?: string;
  showOsaka: boolean;
}

export function ArticleHeader({
  lawCategory,
  law,
  lawName,
  article,
  title,
  titleOsaka,
  showOsaka,
}: ArticleHeaderProps) {
  return (
    <header className="text-center mb-4">
      <Link
        href={`/law/${lawCategory}/${law}`}
        className="inline-block text-lg text-gray-600 mb-2 hover:text-[#E94E77] transition-colors"
      >
        {lawName}
      </Link>
      <AnimatedContent
        showOsaka={showOsaka}
        originalContent={
          <h1 className="text-2xl font-bold mb-6">
            <span className="text-[#E94E77]">{formatArticleNumber(article)} </span>
            <span className="text-gray-800" dangerouslySetInnerHTML={{ __html: title }} />
          </h1>
        }
        osakaContent={
          <h1 className="text-2xl font-bold mb-6">
            <span className="text-[#E94E77]">{formatArticleNumber(article)} </span>
            <span className="text-gray-800">{titleOsaka || title}</span>
          </h1>
        }
      />
    </header>
  );
}
