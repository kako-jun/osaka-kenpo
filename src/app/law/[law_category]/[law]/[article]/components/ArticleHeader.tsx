import { AnimatedContent } from '@/app/components/AnimatedContent';
import { formatArticleNumber } from '@/lib/utils';

interface ArticleHeaderProps {
  article: string | number;
  title: string;
  titleOsaka?: string;
  showOsaka: boolean;
}

export function ArticleHeader({ article, title, titleOsaka, showOsaka }: ArticleHeaderProps) {
  return (
    <header className="text-center mb-4">
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
