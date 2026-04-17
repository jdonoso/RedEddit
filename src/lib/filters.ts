import { RedditPost, FilterSettings } from '@/types/reddit';

const POLITICS_KEYWORDS = [
  'trump', 'biden', 'harris', 'obama', 'clinton', 'election', 'vote', 'voting',
  'congress', 'senate', 'republican', 'democrat', 'gop', 'maga', 'liberal',
  'conservative', 'partisan', 'impeach', 'president', 'white house', 'political',
  'ukraine', 'russia', 'gaza', 'israel', 'war crime', 'nato',
];

const POLITICS_FLAIRS = [
  'politics', 'us politics', 'political', 'news', 'breaking news',
];

const MEME_PATTERNS = [
  /^nobody[:\s]/i,
  /^me[:\s]/i,
  /\bpov[:\s]/i,
  /when you\b/i,
  /that feeling when\b/i,
  /\btfw\b/i,
  /\bmrw\b/i,
  /\bme irl\b/i,
  /\[oc\]/i,
  /day \d+ of/i,
];

const IMAGE_DOMAINS = ['i.redd.it', 'i.imgur.com', 'imgur.com', 'preview.redd.it'];

export function applyFilters(posts: RedditPost[], settings: FilterSettings): RedditPost[] {
  return posts.filter(post => {
    if (settings.filterPolitics && isPolitics(post)) return false;
    if (settings.filterLowEffort && isLowEffort(post)) return false;
    if (settings.filterRepetitive && isRepetitive(post)) return false;
    return true;
  });
}

function isPolitics(post: RedditPost): boolean {
  const titleLower = post.title.toLowerCase();
  if (POLITICS_KEYWORDS.some(kw => titleLower.includes(kw))) return true;
  if (post.link_flair_text) {
    const flairLower = post.link_flair_text.toLowerCase();
    if (POLITICS_FLAIRS.some(f => flairLower.includes(f))) return true;
  }
  if (['politics', 'worldnews', 'news'].includes(post.subreddit.toLowerCase())) return true;
  return false;
}

function isLowEffort(post: RedditPost): boolean {
  const isImage = IMAGE_DOMAINS.some(d => post.domain === d || post.url.includes(d));
  return isImage && post.num_comments < 10;
}

function isRepetitive(post: RedditPost): boolean {
  return MEME_PATTERNS.some(pattern => pattern.test(post.title));
}

export const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  filterPolitics: true,
  filterLowEffort: true,
  filterRepetitive: true,
};

export function getFilterSettings(): FilterSettings {
  if (typeof window === 'undefined') return DEFAULT_FILTER_SETTINGS;
  try {
    const stored = localStorage.getItem('rededit_filters');
    if (stored) return { ...DEFAULT_FILTER_SETTINGS, ...JSON.parse(stored) };
  } catch {
    // ignore
  }
  return DEFAULT_FILTER_SETTINGS;
}

export function saveFilterSettings(settings: FilterSettings): void {
  localStorage.setItem('rededit_filters', JSON.stringify(settings));
}
