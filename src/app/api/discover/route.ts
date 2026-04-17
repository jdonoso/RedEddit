import { NextRequest, NextResponse } from 'next/server';
import { getSuggestionsForSubs, RatedSubInfo } from '@/lib/discovery';
import { searchSubreddits, fetchPosts } from '@/lib/reddit';
import { RedditPost } from '@/types/reddit';

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

  // Reddit search using top liked subs as query seeds
  const likedSubNames = ratedSubs.filter(r => r.ratio >= 0.6).map(r => r.subreddit).slice(0, 3);
  const searchSeeds = likedSubNames.length > 0 ? likedSubNames : userSubs.slice(0, 3);
  let searchResults: string[] = [];
  if (searchSeeds.length > 0) {
    searchResults = await searchSubreddits(searchSeeds.join(' '));
  }

  // Merge, deduplicate, exclude already-subscribed
  const userSubsLower = new Set(userSubs.map(s => s.toLowerCase()));
  const dislikedSubsLower = new Set(ratedSubs.filter(r => r.ratio <= 0.3 && r.dislikes >= 2).map(r => r.subreddit.toLowerCase()));

  const all = [...curated, ...searchResults]
    .filter(s => !userSubsLower.has(s.toLowerCase()))
    .filter(s => !dislikedSubsLower.has(s.toLowerCase()))
    .filter((s, i, arr) => arr.findIndex(x => x.toLowerCase() === s.toLowerCase()) === i)
    .slice(0, 24);

  // Fetch 5 hot posts per suggestion (all of them, in parallel batches)
  const posts: Record<string, RedditPost[]> = {};
  const BATCH = 6;
  for (let i = 0; i < all.length; i += BATCH) {
    const batch = all.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async sub => {
        try {
          const listing = await fetchPosts([sub], undefined, 5);
          posts[sub] = listing.posts.slice(0, 5);
        } catch {
          posts[sub] = [];
        }
      })
    );
  }

  return NextResponse.json({ suggestions: all, posts });
}
