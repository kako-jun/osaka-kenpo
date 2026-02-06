import { ShareButton } from '@/app/components/ShareButton';
import { LikeButton } from '@/app/components/LikeButton';

interface FixedActionButtonsProps {
  articleId: string;
  lawCategory: string;
  law: string;
}

export function FixedActionButtons({ articleId, lawCategory, law }: FixedActionButtonsProps) {
  return (
    <>
      {/* 左上にええやんボタン */}
      <div className="fixed top-20 left-4 z-10">
        <LikeButton articleId={articleId} lawCategory={lawCategory} law={law} />
      </div>

      {/* 右上に広めたるボタン */}
      <div className="fixed top-20 right-4 z-10">
        <ShareButton />
      </div>
    </>
  );
}
