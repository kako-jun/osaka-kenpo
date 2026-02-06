import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UseArticleNavigationProps {
  lawCategory: string;
  law: string;
  viewMode: 'original' | 'osaka';
  toggleViewMode: () => void;
  prevArticle: string | number | null;
  nextArticle: string | number | null;
}

/**
 * 条文ナビゲーション用のカスタムフック
 * キーボードショートカットとスワイプジェスチャーを処理
 */
export function useArticleNavigation({
  lawCategory,
  law,
  viewMode,
  toggleViewMode,
  prevArticle,
  nextArticle,
}: UseArticleNavigationProps) {
  const router = useRouter();

  const navigateToArticle = (articleId: string | number) => {
    router.push(`/law/${lawCategory}/${law}/${articleId}`);
  };

  useEffect(() => {
    // キーボードショートカット
    const handleKeyDown = (event: KeyboardEvent) => {
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        (event.target as HTMLElement)?.tagName
      );

      if (!isInputFocused) {
        if (event.code === 'Space') {
          event.preventDefault();
          toggleViewMode();
        } else if (event.code === 'ArrowLeft' && prevArticle) {
          event.preventDefault();
          navigateToArticle(prevArticle);
        } else if (event.code === 'ArrowRight' && nextArticle) {
          event.preventDefault();
          navigateToArticle(nextArticle);
        }
      }
    };

    // スワイプジェスチャー
    let touchStartX = 0;
    let touchStartY = 0;
    let isTracking = false;
    let isHorizontalSwipe = false;

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0].screenX;
      touchStartY = event.changedTouches[0].screenY;
      isTracking = true;
      isHorizontalSwipe = false;

      const pageContent = document.getElementById('page-content') as HTMLElement | null;
      if (pageContent) {
        pageContent.style.transition = 'none';
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isTracking) return;

      const touchCurrentX = event.changedTouches[0].screenX;
      const touchCurrentY = event.changedTouches[0].screenY;
      const currentDistanceX = touchCurrentX - touchStartX;
      const currentDistanceY = touchCurrentY - touchStartY;

      const absX = Math.abs(currentDistanceX);
      const absY = Math.abs(currentDistanceY);

      if (absX > 20 || absY > 20) {
        if (absY > absX * 1.5) {
          isHorizontalSwipe = false;
        } else if (absX > absY) {
          isHorizontalSwipe = true;
        }
      }

      if (isHorizontalSwipe) {
        const progress = Math.min(Math.abs(currentDistanceX) / 150, 1);
        const scale = 1 - progress * 0.05;

        const pageContent = document.getElementById('page-content') as HTMLElement | null;
        if (pageContent) {
          pageContent.style.transform = `scale(${scale})`;
          pageContent.style.opacity = String(1 - progress * 0.3);
        }
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!isTracking) return;

      const touchEndX = event.changedTouches[0].screenX;
      const touchEndY = event.changedTouches[0].screenY;
      isTracking = false;

      const swipeDistanceX = touchEndX - touchStartX;
      const swipeDistanceY = touchEndY - touchStartY;
      const swipeThreshold = 150;

      const pageContent = document.getElementById('page-content') as HTMLElement | null;
      if (pageContent) {
        pageContent.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        pageContent.style.transform = 'scale(1)';
        pageContent.style.opacity = '1';

        setTimeout(() => {
          pageContent.style.transition = '';
          pageContent.style.transform = '';
          pageContent.style.opacity = '';
        }, 300);
      }

      const absX = Math.abs(swipeDistanceX);
      const absY = Math.abs(swipeDistanceY);

      if (isHorizontalSwipe && absX > swipeThreshold && absX > absY * 1.5) {
        if (swipeDistanceX > 0 && prevArticle) {
          navigateToArticle(prevArticle);
        } else if (swipeDistanceX < 0 && nextArticle) {
          navigateToArticle(nextArticle);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [lawCategory, law, viewMode, toggleViewMode, prevArticle, nextArticle, router]);

  return { navigateToArticle };
}
