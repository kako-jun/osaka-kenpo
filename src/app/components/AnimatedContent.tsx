'use client'

interface AnimatedContentProps {
  originalContent: React.ReactNode
  osakaContent: React.ReactNode
  showOsaka: boolean
  className?: string
}

export const AnimatedContent = ({ 
  originalContent, 
  osakaContent, 
  showOsaka, 
  className = '' 
}: AnimatedContentProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* 高さ確保用の非表示要素 */}
      <div style={{ visibility: 'hidden', position: 'relative' }}>
        {showOsaka ? osakaContent : originalContent}
      </div>
      
      {/* 原文コンテンツ */}
      <div
        className="transition-opacity duration-500 ease-in-out"
        style={{ 
          opacity: showOsaka ? 0 : 1,
          position: 'absolute',
          top: '0px',
          left: '0px',
          right: '0px',
          margin: 0,
          padding: 0,
          pointerEvents: showOsaka ? 'none' : 'auto'
        }}
      >
        {originalContent}
      </div>
      
      {/* 大阪弁コンテンツ */}
      <div
        className="transition-opacity duration-500 ease-in-out"
        style={{ 
          opacity: showOsaka ? 1 : 0,
          position: 'absolute',
          top: '0px',
          left: '0px',
          right: '0px',
          margin: 0,
          padding: 0,
          pointerEvents: showOsaka ? 'auto' : 'none'
        }}
      >
        {osakaContent}
      </div>
    </div>
  )
}