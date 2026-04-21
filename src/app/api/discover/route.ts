import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
import { getSuggestionsForSubs, RatedSubInfo } from '@/lib/discovery';
import { searchSubreddits, fetchPosts } from '@/lib/reddit';
import { RedditPost } from '@/types/reddit';

export interface DiscoverFeedPost {
  post: RedditPost;
  qualityScore: number;
}

export interface DiscoverResult {
  feed: DiscoverFeedPost[];
  suggestedSubs: string[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const subsParam = searchParams.get('subs') ?? '';
  const ratingsParam = searchParams.get('ratings') ?? '';
  const userSubs = subsParam.split(',').filter(Boolean);

  let ratedSubs: RatedSubInfo[] = [];
  if (ratingsParam) {
    try { ratedSubs = JSON.parse(ratingsParam); } catch { /* ignore */ }
  }

  // Curated + ratings-weighted suggestions
  const curated = getSuggestionsForSubs(userSubs, ratedSubs);

  // Reddit search seeded from top liked subs
  const likedSubNames = ratedSubs.filter(r => r.ratio >= 0.6).map(r => r.subreddit).slice(0, 3);
  const searchSeeds = likedSubNames.length > 0 ? likedSubNames : userSubs.slice(0, 3);
  let searchResults: string[] = [];
  if (searchSeeds.length > 0) {
    searchResults = await searchSubreddits(searchSeeds.join(' '));
  }

  // Merge, deduplicate, exclude subscribed + disliked — cast a wide net (40 subs)
  const userSubsLower = new Set(userSubs.map(s => s.toLowerCase()));
  const dislikedSubsLower = new Set(
    ratedSubs.filter(r => r.ratio <= 0.3 && r.dislikes >= 2).map(r => r.subreddit.toLowerCase())
  );

  const suggestedSubs = [...curated, ...searchResults]
    .filter(s => !userSubsLower.has(s.toLowerCase()))
    .filter(s => !dislikedSubsLower.has(s.toLowerCase()))
    .filter((s, i, arr) => arr.findIndex(x => x.toLowerCase() === s.toLowerCase()) === i)
    .slice(0, 40);

  // Fetch top/week posts from every candidate sub in parallel batches
  const allPosts: RedditPost[] = [];
  const BATCH = 8;
  for (let i = 0; i < suggestedSubs.length; i += BATCH) {
    const batch = suggestedSubs.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(sub => fetchPosts([sub], undefined, 5, 'top', 'week'))
    );
    for (const r of results) {
      if (r.status === 'fulfilled') allPosts.push(...r.value.posts);
    }
  }

  // Score each post: score × upvote_ratio rewards genuinely liked content
  const feed: DiscoverFeedPost[] = allPosts
    .filter(p => !p.stickied && !p.over_18)
    .map(p => ({ post: p, qualityScore: p.score * (p.upvote_ratio ?? 1) }))
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .filter((item, i, arr) => arr.findIndex(x => x.post.id === item.post.id) === i)
    .slice(0, 60);

  return NextResponse.json({ feed, suggestedSubs } satisfies DiscoverResult);
}
