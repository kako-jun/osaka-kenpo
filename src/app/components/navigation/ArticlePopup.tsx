import { formatArticleNumber } from '@/lib/utils';
import type { ArticleItem } from '@/hooks/useArticleList';

interface ArticlePopupProps {
  articles: ArticleItem[];
  currentArticle: string | number;
  onSelect: (articleId: string | number) => void;
  onClose: () => void;
}

export function ArticlePopup({ articles, currentArticle, onSelect, onClose }: ArticlePopupProps) {
  return (
    <>
      {/* 透明なオーバーレイ（背景クリック/タッチで閉じる用） */}
      <div
        className="fixed inset-0 z-40 touch-manipulation"
        onClick={onClose}
        onTouchEnd={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* ポップアップ内容 */}
      <div
        className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
        style={{ minWidth: '300px', maxWidth: '400px' }}
      >
        <div className="p-4 border-b border-gray-200" style={{ backgroundColor: '#FFF8DC' }}>
          <h3 className="font-medium" style={{ color: '#8B4513' }}>
            📖 条文を選択しなはれ
          </h3>
        </div>
        <div className="py-2">
          {articles.map((article) => (
            <button
              key={article.article}
              onClick={() => onSelect(article.article)}
              className={`w-full text-left px-4 py-2 transition-colors hover:bg-gray-100 ${
                String(article.article) === String(currentArticle)
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-400'
                  : 'text-gray-700'
              }`}
            >
              <span className="font-medium">{formatArticleNumber(article.article)}</span>
              {article.title ? (
                <span className="ml-2 text-sm text-gray-600">
                  {article.title.replace(/<rt[^>]*>.*?<\/rt>/g, '').replace(/<\/?ruby>/g, '')}
                </span>
              ) : article.originalText ? (
                <span className="ml-2 text-sm text-gray-400 italic">{article.originalText}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
