import { AnimatedContent } from '@/app/components/AnimatedContent';
import { SpeakerButton } from '@/components/SpeakerButton';
import { highlightKeywords } from '@/lib/text_highlight';

interface ArticleTextSectionProps {
  originalText: string[];
  osakaText: string[];
  showOsaka: boolean;
  onToggleView: () => void;
}

export function ArticleTextSection({
  originalText,
  osakaText,
  showOsaka,
  onToggleView,
}: ArticleTextSectionProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.08)] p-8 mb-8 relative cursor-pointer select-none"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onToggleView();
      }}
      title="クリックまたはスペースキーで表示を切り替え"
    >
      <AnimatedContent
        showOsaka={showOsaka}
        originalContent={
          <div className="text-lg leading-relaxed">
            <div className="text-gray-800">
              {originalText.map((paragraph, index) => (
                <p key={index} className="mb-3" dangerouslySetInnerHTML={{ __html: paragraph }} />
              ))}
            </div>
          </div>
        }
        osakaContent={
          <div className="text-lg leading-relaxed">
            <div className="text-gray-800" style={{ color: 'var(--primary-color)' }}>
              {osakaText.map((paragraph, index) => (
                <p key={index} className="mb-3">
                  {highlightKeywords(paragraph)}
                </p>
              ))}
            </div>
          </div>
        }
      />

      <div className="absolute bottom-4 right-4 z-10">
        <SpeakerButton
          text={showOsaka ? osakaText.join('\n\n') : originalText.join('\n\n')}
          voice={showOsaka ? 'female' : 'male'}
        />
      </div>
    </div>
  );
}
