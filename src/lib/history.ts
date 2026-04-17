const KEY = 'rededit_seen';
const MAX_ENTRIES = 2000;

export function getSeenIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const arr: string[] = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function isSeen(id: string): boolean {
  return getSeenIds().has(id);
}

export function markSeen(id: string): void {
  const seen = getSeenIds();
  seen.add(id);
  // Trim to most recent MAX_ENTRIES
  const arr = Array.from(seen).slice(-MAX_ENTRIES);
  localStorage.setItem(KEY, JSON.stringify(arr));
}

export function clearHistory(): void {
  localStorage.removeItem(KEY);
}
