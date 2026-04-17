import { NextRequest, NextResponse } from 'next/server';
import { getSuggestionsForSubs } from '@/lib/discovery';
import { searchSubreddits } from '@/lib/reddit';
import { fetchPosts } from '@/lib/reddit';

export async function GET(req: NextRequest) {
  const subsParam = req.nextUrl.searchParams.get('subs') ?? '';
  const userSubs = subsParam.split(',').filter(Boolean);

  // Curated suggestions
  const curated = getSuggestionsForSubs(userSubs);

  // Reddit search fallback: find subs similar to the user's top subs
  let searchResults: string[] = [];
  if (userSubs.length > 0) {
    const query = userSubs.slice(0, 3).join(' ');
    searchResults = await searchSubreddits(query);
  }

  // Merge, deduplicate, exclude already-subscribed
  const userSubsLower = new Set(userSubs.map(s => s.toLowerCase()));
  const all = [...curated, ...searchResults]
    .filter(s => !userSubsLower.has(s.toLowerCase()))
    .filter((s, i, arr) => arr.findIndex(x => x.toLowerCase() === s.toLowerCase()) === i)
    .slice(0, 20);

  // Fetch a sample of posts from top 8 suggestions for preview
  const previews: Record<string, { title: string; score: number }[]> = {};
  await Promise.all(
    all.slice(0, 8).map(async sub => {
      try {
        const listing = await fetchPosts([sub], undefined, 3);
        previews[sub] = listing.posts.slice(0, 3).map(p => ({ title: p.title, score: p.score }));
      } catch {
        previews[sub] = [];
      }
    })
  );

  return NextResponse.json({ suggestions: all, previews });
}
