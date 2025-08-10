'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
      <button onClick={() => setIsOpen(!isOpen)} className="absolute top-4 left-4 z-30">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 6h16M4 12h16m-7 6h7"></path>
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
        className={`fixed top-0 left-0 w-64 h-full bg-[#E94E77] text-white z-30 transform transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button Inside Menu */}
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        
        <nav className="mt-16 text-lg space-y-2 p-4 text-left">
          <Link href="/" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">ホーム</Link>
          
          <div className="pt-4">
            <p className="text-white/70 text-sm px-2 mb-2">--- 日本の法律 ---</p>
            <Link href="/law/constitution" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">日本国憲法</Link>
            <Link href="/law/minpou" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">民法</Link>
            <Link href="/law/shouhou" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">商法</Link>
            <Link href="/law/keihou" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">刑法</Link>
          </div>

          <div className="pt-4">
            <p className="text-white/70 text-sm px-2 mb-2">--- 比較 ---</p>
            <Link href="#" onClick={() => setIsOpen(false)} className="block p-2 rounded text-white/50 cursor-not-allowed">大日本帝国憲法 (準備中)</Link>
            <Link href="#" onClick={() => setIsOpen(false)} className="block p-2 rounded text-white/50 cursor-not-allowed">ドイツ基本法 (準備中)</Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Menu;
