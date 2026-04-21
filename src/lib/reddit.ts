import { RedditPost, RedditListing, RedditComment, RedditCommentListing } from '@/types/reddit';

const REDDIT_BASE = 'https://www.reddit.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.207 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
};

export type SortType = 'hot' | 'new' | 'top';
export type TopTime = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' | '4h' | '12h';

function timeToCutoff(time: TopTime): number {
  const now = Math.floor(Date.now() / 1000);
  switch (time) {
    case '4h':   return now - 4 * 3600;
    case '12h':  return now - 12 * 3600;
    case 'day':  return now - 86400;
    case 'week': return now - 7 * 86400;
    default:     return 0;
  }
}

function topTimeParam(time: TopTime): string {
  switch (time) {
    case '4h':
    case '12h':
    case 'day':  return 'day';
    case 'week': return 'week';
    case 'month': return 'month';
    case 'year': return 'year';
    default:     return 'day';
  }
}

export async function fetchPosts(
  subreddits: string[],
  after?: string,
  limit = 25,
  sort: SortType = 'hot',
  time: TopTime = 'week'
): Promise<RedditListing> {
  const multi = subreddits.join('+');
  const cutoff = timeToCutoff(time);
  const needsClientFilter = cutoff > 0;
  const fetchLimit = needsClientFilter ? 100 : limit;
  const params = new URLSearchParams({ limit: String(fetchLimit), raw_json: '1' });
  if (after) params.set('after', after);
  if (sort === 'top') params.set('t', topTimeParam(time));

  const res = await fetch(`${REDDIT_BASE}/r/${multi}/${sort}.json?${params}`, {
    headers: HEADERS,
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Reddit API error: ${res.status}`);

  const json = await res.json();
  const children = json.data?.children ?? [];

  let posts: RedditPost[] = children
    .filter((c: { kind: string }) => c.kind === 't3')
    .map((c: { data: RedditPost }) => c.data);

  if (needsClientFilter) {
    posts = posts.filter(p => p.created_utc >= cutoff).slice(0, limit);
  }

  return {
    posts,
    after: json.data?.after ?? null,
    before: json.data?.before ?? null,
  };
}

export async function fetchComments(
  subreddit: string,
  postId: string
): Promise<{ post: RedditPost; comments: RedditComment[] }> {
  const res = await fetch(
    `${REDDIT_BASE}/r/${subreddit}/comments/${postId}.json?raw_json=1&limit=500`,
    { headers: HEADERS, next: { revalidate: 60 } }
  );

  if (!res.ok) throw new Error(`Reddit API error: ${res.status}`);

  const [postListing, commentListing] = await res.json();

  const post: RedditPost = postListing.data.children[0].data;
  const comments = flattenComments(commentListing as RedditCommentListing);

  return { post, comments };
}

export async function searchSubreddits(query: string): Promise<string[]> {
  const params = new URLSearchParams({ q: query, limit: '10', raw_json: '1' });
  const res = await fetch(`${REDDIT_BASE}/subreddits/search.json?${params}`, {
    headers: HEADERS,
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data?.children ?? [])
    .map((c: { data: { display_name: string } }) => c.data.display_name as string);
}

function flattenComments(listing: RedditCommentListing): RedditComment[] {
  const result: RedditComment[] = [];
  for (const child of listing.data.children) {
    if (child.kind === 't1') {
      result.push(child.data as RedditComment);
    }
  }
  return result;
}
