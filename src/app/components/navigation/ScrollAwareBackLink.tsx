'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/icons';

interface ScrollAwareBackLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ScrollAwareBackLink({ href, children }: ScrollAwareBackLinkProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 50px以上スクロールしたら背景を表示
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Link
      href={href}
      className={`flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all px-3 py-2 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <ArrowLeftIcon className="w-4 h-4 mr-1" />
      {children}
    </Link>
  );
}
