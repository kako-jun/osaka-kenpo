'use client';

import { createContext, useState, useContext, useCallback, useMemo, ReactNode } from 'react';

interface EeyanContextType {
  /** Incremented each time an eeyan action occurs, triggering re-fetch in consumers */
  revision: number;
  /** Call this after an eeyan toggle to notify all consumers */
  notifyEeyanChanged: () => void;
}

const EeyanContext = createContext<EeyanContextType | undefined>(undefined);

export function EeyanProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);

  const notifyEeyanChanged = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, []);

  const value = useMemo(() => ({ revision, notifyEeyanChanged }), [revision, notifyEeyanChanged]);

  return <EeyanContext.Provider value={value}>{children}</EeyanContext.Provider>;
}

export function useEeyanRevision(): number {
  const ctx = useContext(EeyanContext);
  if (!ctx) throw new Error('useEeyanRevision must be used within EeyanProvider');
  return ctx.revision;
}

export function useNotifyEeyanChanged(): () => void {
  const ctx = useContext(EeyanContext);
  if (!ctx) throw new Error('useNotifyEeyanChanged must be used within EeyanProvider');
  return ctx.notifyEeyanChanged;
}
