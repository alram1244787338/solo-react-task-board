export const STORAGE_KEY = 'task-board-state';

export function restoreStateFromStorage(init, getStorageItem) {
  try {
    const saved = getStorageItem(STORAGE_KEY);
    if (!saved) return init;
    const parsed = JSON.parse(saved);
    return normalizeState(parsed, init);
  } catch {
    return init;
  }
}

export function normalizeState(parsed, fallback = { columns: [], cards: {} }) {
  if (!parsed || typeof parsed !== 'object') {
    return fallback;
  }
  return {
    columns: Array.isArray(parsed.columns) ? parsed.columns : [],
    cards:
      parsed.cards &&
      typeof parsed.cards === 'object' &&
      !Array.isArray(parsed.cards)
        ? parsed.cards
        : {},
  };
}
