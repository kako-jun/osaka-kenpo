'use client'

import { createContext, useState, useContext, ReactNode, useEffect } from 'react'
import type { ViewMode } from '@/lib/types'

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('osaka'); // デフォルトは大阪弁
  const [isInitialized, setIsInitialized] = useState(false);

  // ローカルストレージから読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('osaka-kenpo-viewmode');
      if (saved && (saved === 'osaka' || saved === 'original')) {
        setViewMode(saved as ViewMode);
      }
      setIsInitialized(true);
    }
  }, []);

  // ローカルストレージに保存する関数
  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('osaka-kenpo-viewmode', mode);
    }
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode: updateViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};
