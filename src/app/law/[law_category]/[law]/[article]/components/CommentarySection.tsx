import { AnimatedContent } from '@/app/components/AnimatedContent';
import { SpeakerButton } from '@/components/SpeakerButton';
import { LightBulbIcon, ChatBubbleIcon } from '@/components/icons';
import { highlightKeywords } from '@/lib/text_highlight';

interface CommentarySectionProps {
  commentary: string[];
  commentaryOsaka?: string[];
  showOsaka: boolean;
  onToggleView: () => void;
}

export function CommentarySection({
  commentary,
  commentaryOsaka,
  showOsaka,
  onToggleView,
}: CommentarySectionProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-6 border-2 border-red-400 relative cursor-pointer select-none"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onToggleView();
      }}
      title="クリックまたはスペースキーで表示を切り替え"
    >
      <div className="absolute -top-4 left-6 bg-red-500 rounded-full w-8 h-8 flex items-center justify-center">
        <LightBulbIcon />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center">
          <ChatBubbleIcon className="mr-2" />
          ワンポイント解説
        </h3>
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

      <div className="absolute bottom-4 right-4 z-10">
        <SpeakerButton
          text={showOsaka ? (commentaryOsaka || commentary).join('\n\n') : commentary.join('\n\n')}
          voice={showOsaka ? 'female' : 'male'}
        />
      </div>
    </div>
  );
}
