export const DEFAULT_SUBREDDITS = [
  'programming',
  'science',
  'technology',
  'AskReddit',
  'todayilearned',
  'IAmA',
  'explainlikeimfive',
  'bestof',
  'books',
  'movies',
  'music',
  'gaming',
  'videos',
  'funny',
  'changemyview',
  'history',
  'philosophy',
  'nfl',
];

export function getSubreddits(): string[] {
  if (typeof window === 'undefined') return DEFAULT_SUBREDDITS;
  try {
    const stored = localStorage.getItem('rededit_subreddits');
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return DEFAULT_SUBREDDITS;
}

export function saveSubreddits(subs: string[]): void {
  localStorage.setItem('rededit_subreddits', JSON.stringify(subs));
}
