export type Rating = 'like' | 'dislike';

export interface RatedPost {
  id: string;
  title: string;
  subreddit: string;
  author: string;
  domain: string;
  rating: Rating;
  ratedAt: number;
}

const KEY = 'rededit_ratings';

export function getRatings(): Record<string, RatedPost> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function ratePost(post: Omit<RatedPost, 'ratedAt' | 'rating'>, rating: Rating | null): void {
  const ratings = getRatings();
  if (rating === null) {
    delete ratings[post.id];
  } else {
    ratings[post.id] = { ...post, rating, ratedAt: Date.now() };
  }
  localStorage.setItem(KEY, JSON.stringify(ratings));
}

export function getPostRating(id: string): Rating | null {
  return getRatings()[id]?.rating ?? null;
}

export interface SubredditStats {
  subreddit: string;
  likes: number;
  dislikes: number;
  ratio: number; // likes / total
  posts: RatedPost[];
}

export function getStatsBySubreddit(): SubredditStats[] {
  const ratings = Object.values(getRatings());
  const bySubreddit: Record<string, RatedPost[]> = {};

  for (const r of ratings) {
    (bySubreddit[r.subreddit] ??= []).push(r);
  }

  return Object.entries(bySubreddit)
    .map(([subreddit, posts]) => {
      const likes = posts.filter(p => p.rating === 'like').length;
      const dislikes = posts.filter(p => p.rating === 'dislike').length;
      return {
        subreddit,
        likes,
        dislikes,
        ratio: likes / (likes + dislikes),
        posts: posts.sort((a, b) => b.ratedAt - a.ratedAt),
      };
    })
    .sort((a, b) => b.likes + b.dislikes - (a.likes + a.dislikes));
}
