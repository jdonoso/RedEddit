import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
import { fetchPosts, SortType, TopTime } from '@/lib/reddit';
import { applyFilters, DEFAULT_FILTER_SETTINGS } from '@/lib/filters';
import { FilterSettings } from '@/types/reddit';
import { DEFAULT_SUBREDDITS } from '@/lib/subreddits';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const after = searchParams.get('after') ?? undefined;
  const limit = Number(searchParams.get('limit') ?? 50);
  const sort = (searchParams.get('sort') ?? 'hot') as SortType;
  const time = (searchParams.get('time') ?? 'week') as TopTime;

  const subsParam = searchParams.get('subs');
  const subreddits = subsParam ? subsParam.split(',').filter(Boolean) : DEFAULT_SUBREDDITS;

  const filtersParam = searchParams.get('filters');
  const filterSettings: FilterSettings = filtersParam
    ? { ...DEFAULT_FILTER_SETTINGS, ...JSON.parse(filtersParam) }
    : DEFAULT_FILTER_SETTINGS;

  try {
    const listing = await fetchPosts(subreddits, after, Math.min(limit * 2, 100), sort, time);
    const filtered = applyFilters(listing.posts, filterSettings).slice(0, 25);
    return NextResponse.json({ ...listing, posts: filtered });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
