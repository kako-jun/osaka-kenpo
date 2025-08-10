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
            <p className="text-white/70 text-sm px-2 mb-2">--- ろっぽう ---</p>
            <Link href="/law/jp/constitution" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">日本国憲法</Link>
            <Link href="/law/jp/minpou" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">民法</Link>
            <Link href="/law/jp/shouhou" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">商法</Link>
            <Link href="/law/jp/keihou" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">刑法</Link>
            <Link href="/law/jp/minji_soshou_hou" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">民事訴訟法</Link>
            <Link href="/law/jp/keiji_soshou_hou" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">刑事訴訟法</Link>
          </div>

          <div className="pt-4">
            <p className="text-white/70 text-sm px-2 mb-2">--- むかしの法律 ---</p>
            <Link href="/law/jp_old/jushichijo_kenpo" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">十七条の憲法</Link>
            <Link href="/law/jp_old/taiho_ritsuryo" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">大宝律令</Link>
            <Link href="/law/jp_old/goseibai_shikimoku" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">御成敗式目</Link>
            <Link href="/law/jp_old/buke_shohatto" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">武家諸法度</Link>
            <Link href="/law/jp_old/kinchu_kuge_shohatto" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">禁中並公家諸法度</Link>
            <Link href="/law/jp_old/meiji_kenpo" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">大日本帝国憲法</Link>
          </div>

          <div className="pt-4">
            <p className="text-white/70 text-sm px-2 mb-2">--- がいこくの法律 ---</p>
            <Link href="/law/foreign/german_basic_law" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">ドイツ基本法</Link>
            <Link href="/law/foreign/us_constitution" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">アメリカ合衆国憲法</Link>
            <Link href="/law/foreign/prc_constitution" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">中華人民共和国憲法</Link>
          </div>

          <div className="pt-4">
            <p className="text-white/70 text-sm px-2 mb-2">--- がいこくのむかしの法律 ---</p>
            <Link href="/law/foreign_old/hammurabi_code" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">ハンムラビ法典</Link>
            <Link href="/law/foreign_old/magna_carta" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">マグナ・カルタ</Link>
            <Link href="/law/foreign_old/napoleonic_code" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">ナポレオン法典</Link>
          </div>

          <div className="pt-4">
            <p className="text-white/70 text-sm px-2 mb-2">--- 国際条約 ---</p>
            <Link href="/law/treaty/antarctic_treaty" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">南極条約</Link>
            <Link href="/law/treaty/ramsar_convention" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">ラムサール条約</Link>
            <Link href="/law/treaty/un_charter" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">国際連合憲章</Link>
            <Link href="/law/treaty/npt" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">核拡散防止条約</Link>
            <Link href="/law/treaty/outer_space_treaty" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">宇宙条約</Link>
            <Link href="/law/treaty/universal_postal_convention" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">万国郵便条約</Link>
            <Link href="/law/treaty/olympic_charter" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">オリンピック憲章</Link>
            <Link href="/law/treaty/extradition_treaty" onClick={() => setIsOpen(false)} className="block p-2 rounded hover:bg-white/20">犯罪人引渡し条約</Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Menu;
