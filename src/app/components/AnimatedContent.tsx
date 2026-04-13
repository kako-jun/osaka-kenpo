'use client';

interface AnimatedContentProps {
  originalContent: React.ReactNode;
  osakaContent: React.ReactNode;
  showOsaka: boolean;
  className?: string;
}

export const AnimatedContent = ({
  originalContent,
  osakaContent,
  showOsaka,
  className = '',
}: AnimatedContentProps) => {
  return (
    <div className={`grid ${className}`} style={{ gridTemplateAreas: '"content"' }}>
      {/* 原文コンテンツ */}
      <div
        className="transition-opacity duration-500 ease-in-out"
        style={{
          gridArea: 'content',
          opacity: showOsaka ? 0 : 1,
          pointerEvents: showOsaka ? 'none' : 'auto',
        }}
        aria-hidden={showOsaka}
      >
        {originalContent}
      </div>

      {/* 大阪弁コンテンツ */}
      <div
        className="transition-opacity duration-500 ease-in-out"
        style={{
          gridArea: 'content',
          opacity: showOsaka ? 1 : 0,
          pointerEvents: showOsaka ? 'auto' : 'none',
        }}
        aria-hidden={!showOsaka}
      >
        {osakaContent}
      </div>
    </div>
  );
};
