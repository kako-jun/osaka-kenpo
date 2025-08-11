'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import lawsMetadata from '@/data/laws-metadata.json';

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);

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
        
        <nav className="mt-16 text-lg space-y-4 p-4 text-left h-full overflow-y-auto pb-20">
          <Link href="/" onClick={() => setIsOpen(false)} className="block p-3 rounded-lg hover:bg-white/10 transition-colors font-bold">
            🏠 ホーム
          </Link>
          
          {lawsMetadata.categories.map((category) => (
            <div key={category.id} className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg mb-2">
                <span className="text-lg">{category.icon}</span>
                <span className="font-bold text-sm">{category.title}</span>
              </div>
              {category.laws
                .sort((a, b) => a.year - b.year)
                .map((law) => (
                  <Link 
                    key={law.path}
                    href={law.path} 
                    onClick={() => setIsOpen(false)} 
                    className="block pl-6 pr-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    {law.year && law.year > 0 && (
                      <span className="text-xs text-white/60">{law.year}年</span>
                    )}
                    {law.year && law.year < 0 && (
                      <span className="text-xs text-white/60">{law.year}年</span>
                    )}
                    {' '}{law.name}
                  </Link>
                ))}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Menu;