'use client';

import { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import type { ViewMode } from '@/lib/types';
import { getViewMode, setViewMode as saveViewMode } from '@/lib/storage';

interface ViewModeContextType {
  viewMode: ViewMode;
}

interface ViewModeActionsContextType {
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);
const ViewModeActionsContext = createContext<ViewModeActionsContextType | undefined>(undefined);

export const ViewModeProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('osaka'); // デフォルトは大阪弁
  const [isInitialized, setIsInitialized] = useState(false);

  // ローカルストレージから読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = getViewMode();
      if (saved === 'osaka' || saved === 'original') {
        setViewMode(saved);
      }
      setIsInitialized(true);
    }
  }, []);

  // ローカルストレージに保存する関数
  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    saveViewMode(mode);
  };

  // stateとactionsを分離して、actionsは再レンダーを引き起こさない
  const stateValue = useMemo(() => ({ viewMode }), [viewMode]);
  const actionsValue = useMemo(() => ({ setViewMode: updateViewMode }), []);

  return (
    <ViewModeActionsContext.Provider value={actionsValue}>
      <ViewModeContext.Provider value={stateValue}>{children}</ViewModeContext.Provider>
    </ViewModeActionsContext.Provider>
  );
};

// viewModeの値だけが必要な場合（再レンダーされる）
export const useViewModeValue = () => {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewModeValue must be used within a ViewModeProvider');
  }
  return context.viewMode;
};

// setViewModeだけが必要な場合（再レンダーされない）
export const useViewModeActions = () => {
  const context = useContext(ViewModeActionsContext);
  if (context === undefined) {
    throw new Error('useViewModeActions must be used within a ViewModeProvider');
  }
  return context;
};

// 両方が必要な場合（従来の互換性用）
export const useViewMode = () => {
  const viewMode = useViewModeValue();
  const { setViewMode } = useViewModeActions();
  return { viewMode, setViewMode };
};
