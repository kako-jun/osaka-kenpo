'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadBatchMetadata } from '@/lib/metadata_loader';

// カテゴリ別絵文字アイコンコンポーネント
const CategoryIcon = ({ categoryId }: { categoryId: string }) => {
  const emojiMap: { [key: string]: string } = {
    'shinchaku': '🍚',
    'roppou': '⚖️',
    'mukashi': '📜',
    'gaikoku': '🌍',
    'gaikoku_mukashi': '🏛️',
    'treaty': '🤝'
  };

  return <span className="text-lg">{emojiMap[categoryId] || '📄'}</span>;
};

type LawWithMetadata = {
  id: string;
  path: string;
  status: string;
  name?: string;
  year?: number;
};

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lawsWithMetadata, setLawsWithMetadata] = useState<any[]>([]);

  // 法律メタデータを読み込む
  useEffect(() => {
    const loadAllMetadata = async () => {
      try {
        const { lawsMetadata, lawMetadata } = await loadBatchMetadata();
        
        if (!lawsMetadata) {
          return;
        }

        const categoriesWithMetadata = lawsMetadata.categories.map((category) => {
          const lawsWithMetadata = category.laws.map((law) => {
            const pathParts = law.path.split('/');
            const lawCategory = pathParts[2];
            const lawId = pathParts[3];
            const key = `${lawCategory}/${lawId}`;
            
            const metadata = lawMetadata[key];
            
            return {
              ...law,
              name: metadata?.shortName || metadata?.name || law.id,
              year: metadata?.year || null
            };
          });
          
          return {
            ...category,
            laws: lawsWithMetadata
          };
        });
        
        setLawsWithMetadata(categoriesWithMetadata);
      } catch (error) {
        console.error('メニュー: メタデータ読み込みエラー:', error);
      }
    };

    loadAllMetadata();
  }, []);

  // メニューが開いている間、背景のスクロールを禁止する
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <div>
      {/* Hamburger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="absolute top-4 left-4 z-30 p-2 rounded-lg hover:bg-white/20 transition-colors"
        aria-label="メニューを開く"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Menu Panel */}
      <div
        className={`fixed top-0 left-0 w-72 h-full bg-gradient-to-b from-[#E94E77] to-[#d63d66] text-white z-30 transform transition-transform overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button Inside Menu */}
        {/* メニュー上部の横長クリックエリア */}
        <div 
          className="absolute top-0 left-0 w-full h-16 z-40 cursor-pointer"
          onClick={() => setIsOpen(false)}
          aria-label="メニューを閉じる"
        ></div>
        
        <button 
          onClick={() => setIsOpen(false)} 
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors z-40"
          aria-label="メニューを閉じる"
        >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        
        <nav className="mt-16 text-lg space-y-4 px-4 pt-0 text-left h-full overflow-y-auto pb-32">
          <div className="space-y-1 mb-4">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors font-bold">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              ホーム
            </Link>
            
            <Link href="/about" onClick={() => setIsOpen(false)} className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors font-bold">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              このサイトのこと
            </Link>
          </div>
          
          {lawsWithMetadata.map((category) => (
            <div key={category.id} className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 bg-black/15 rounded-lg mb-2">
                <span className="text-lg">{category.icon || '📄'}</span>
                <span className="font-bold text-sm">{category.title}</span>
              </div>
              {category.laws
                .sort((a, b) => (a.year || 0) - (b.year || 0))
                .map((law) => {
                  const isAvailable = law.status === 'available';
                  
                  if (isAvailable) {
                    return (
                      <Link 
                        key={law.path}
                        href={law.path} 
                        onClick={() => setIsOpen(false)} 
                        className="block pl-6 pr-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                      >
                        <div className="flex items-center">
                          {law.year && law.year > 0 && (
                            <span className="text-xs text-white/60 mr-3">{law.year}年</span>
                          )}
                          {law.year && law.year < 0 && (
                            <span className="text-xs text-white/60 mr-3">{law.year}年</span>
                          )}
                          <span>{law.name}</span>
                        </div>
                      </Link>
                    );
                  } else {
                    return (
                      <div 
                        key={law.path}
                        className="block pl-6 pr-3 py-2 text-sm cursor-default"
                      >
                        <div className="flex items-center text-white/40">
                          {law.year && law.year > 0 && (
                            <span className="text-xs text-white/30 mr-3">{law.year}年</span>
                          )}
                          {law.year && law.year < 0 && (
                            <span className="text-xs text-white/30 mr-3">{law.year}年</span>
                          )}
                          <span>{law.name}</span>
                        </div>
                      </div>
                    );
                  }
                })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Menu;