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
      {/* 原文コンテンツ */}
      <div
        className="transition-opacity duration-500 ease-in-out"
        style={{ 
          opacity: showOsaka ? 0 : 1,
          position: showOsaka ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          right: 0
        }}
      >
        {originalContent}
      </div>
      
      {/* 大阪弁コンテンツ */}
      <div
        className="transition-opacity duration-500 ease-in-out"
        style={{ 
          opacity: showOsaka ? 1 : 0,
          position: showOsaka ? 'relative' : 'absolute',
          top: 0,
          left: 0,
          right: 0
        }}
      >
        {osakaContent}
      </div>
    </div>
  )
}