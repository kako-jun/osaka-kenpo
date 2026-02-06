import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/icons';

interface BackToListLinkProps {
  lawCategory: string;
  law: string;
  className?: string;
}

export function BackToListLink({ lawCategory, law, className = '' }: BackToListLinkProps) {
  return (
    <Link
      href={`/law/${lawCategory}/${law}`}
      className={`flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors ${className}`}
    >
      <ArrowLeftIcon className="w-4 h-4 mr-1" />
      条文一覧へ
    </Link>
  );
}
