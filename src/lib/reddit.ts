import { RedditPost, RedditListing, RedditComment, RedditCommentListing } from '@/types/reddit';
import { getCloudflareContext } from '@opennextjs/cloudflare';

const REDDIT_BASE = 'https://www.reddit.com';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.207 Safari/537.36',
  'Accept': 'application/json',
};

async function redditFetch(path: string, params: URLSearchParams): Promise<Response> {
  // Use service binding in CF Workers runtime to avoid Worker-to-Worker HTTP issues
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { env } = getCloudflareContext() as any;
    if (env?.REDDIT_PROXY) {
      const url = `${REDDIT_BASE}${path}?${params}`;
      return env.REDDIT_PROXY.fetch(new Request(url));
    }
  } catch {
    // Not in CF Workers runtime (local dev) — fall through to direct fetch
  }
  return fetch(`${REDDIT_BASE}${path}?${params}`, { headers: HEADERS });
}

export type SortType = 'hot' | 'new' | 'top';
export type TopTime = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';

export async function fetchPosts(
  subreddits: string[],
  after?: string,
  limit = 25,
  sort: SortType = 'hot',
  time: TopTime = 'week'
): Promise<RedditListing> {
  const multi = subreddits.join('+');
  const params = new URLSearchParams({ limit: String(limit), raw_json: '1' });
  if (after) params.set('after', after);
  if (sort === 'top') params.set('t', time);

  const res = await redditFetch(`/r/${multi}/${sort}.json`, params);

  if (!res.ok) throw new Error(`Reddit API error: ${res.status}`);

  const json = await res.json();
  const children = json.data?.children ?? [];

  const posts: RedditPost[] = children
    .filter((c: { kind: string }) => c.kind === 't3')
    .map((c: { data: RedditPost }) => c.data);

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
  const params = new URLSearchParams({ raw_json: '1', limit: '500' });
  const res = await redditFetch(`/r/${subreddit}/comments/${postId}.json`, params);

  if (!res.ok) throw new Error(`Reddit API error: ${res.status}`);

  const [postListing, commentListing] = await res.json();

  const post: RedditPost = postListing.data.children[0].data;
  const comments = flattenComments(commentListing as RedditCommentListing);

  return { post, comments };
}

export async function searchSubreddits(query: string): Promise<string[]> {
  const params = new URLSearchParams({ q: query, limit: '10', raw_json: '1' });
  const res = await redditFetch('/subreddits/search.json', params);
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
