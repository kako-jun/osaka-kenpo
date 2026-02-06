import { AnimatedContent } from '@/app/components/AnimatedContent';
import { SpeakerButton } from '@/components/SpeakerButton';
import { LikeButton } from '@/app/components/LikeButton';
import { LightBulbIcon } from '@/components/icons';
import { highlightKeywords } from '@/lib/text_highlight';

interface CommentarySectionProps {
  commentary: string[];
  commentaryOsaka?: string[];
  showOsaka: boolean;
  onToggleView: () => void;
  articleId: string;
  lawCategory: string;
  law: string;
}

export function CommentarySection({
  commentary,
  commentaryOsaka,
  showOsaka,
  onToggleView,
  articleId,
  lawCategory,
  law,
}: CommentarySectionProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-6 pt-8 border-2 border-red-400 relative cursor-pointer select-none"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onToggleView();
      }}
      title="クリックまたはスペースキーで表示を切り替え"
    >
      <div className="absolute -top-4 left-6 bg-red-500 rounded-full px-4 py-1.5 flex items-center gap-2">
        <LightBulbIcon />
        <span className="text-white text-sm font-bold">ワンポイント解説</span>
      </div>

      <div className="p-4 pt-2">
        <AnimatedContent
          showOsaka={showOsaka}
          originalContent={
            <div className="leading-relaxed">
              <div className="text-gray-700">
                {commentary.map((paragraph, index) => (
                  <p key={index} className="mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          }
          osakaContent={
            <div className="leading-relaxed">
              <div className="text-gray-700" style={{ color: 'var(--primary-color)' }}>
                {(commentaryOsaka || commentary).map((paragraph, index) => (
                  <p key={index} className="mb-3">
                    {highlightKeywords(paragraph)}
                  </p>
                ))}
              </div>
            </div>
          }
        />
      </div>

      {/* ボタンエリア: ええやんセンタリング、スピーカー右寄せ */}
      <div className="flex justify-center items-center relative mt-4 pt-4 border-t border-gray-200">
        <LikeButton articleId={articleId} lawCategory={lawCategory} law={law} />
        <div className="absolute right-0">
          <SpeakerButton
            text={
              showOsaka ? (commentaryOsaka || commentary).join('\n\n') : commentary.join('\n\n')
            }
            voice={showOsaka ? 'female' : 'male'}
          />
        </div>
      </div>
    </div>
  );
}
