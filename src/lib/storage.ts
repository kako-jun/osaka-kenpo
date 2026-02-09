// Unified localStorage management under single "osaka-kenpo" key

import type { ViewMode } from '@/lib/types';

const STORAGE_KEY = 'osaka-kenpo';

export interface OsakaKenpoStorage {
  viewMode: ViewMode;
  eeyan: {
    userId: string;
  };
}

const DEFAULT_STORAGE: OsakaKenpoStorage = {
  viewMode: 'osaka',
  eeyan: {
    userId: '',
  },
};

function readStorage(): OsakaKenpoStorage {
  if (typeof localStorage === 'undefined') return DEFAULT_STORAGE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        viewMode: parsed.viewMode ?? DEFAULT_STORAGE.viewMode,
        eeyan: { ...DEFAULT_STORAGE.eeyan, ...parsed.eeyan },
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_STORAGE;
}

function writeStorage(data: OsakaKenpoStorage): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function updateStorage<K extends keyof OsakaKenpoStorage>(
  key: K,
  updater: (current: OsakaKenpoStorage[K]) => OsakaKenpoStorage[K]
): void {
  const data = readStorage();
  data[key] = updater(data[key]);
  writeStorage(data);
}

// ============ ViewMode ============

export function getViewMode(): ViewMode {
  return readStorage().viewMode;
}

export function setViewMode(mode: ViewMode): void {
  updateStorage('viewMode', () => mode);
}

// ============ Eeyan ============

export function getEeyanUserId(): string {
  return readStorage().eeyan.userId;
}

export function setEeyanUserId(id: string): void {
  updateStorage('eeyan', (e) => ({ ...e, userId: id }));
}

export function getOrCreateEeyanUserId(): string {
  const existing = getEeyanUserId();
  if (existing) return existing;
  const id = crypto.randomUUID();
  setEeyanUserId(id);
  return id;
}
