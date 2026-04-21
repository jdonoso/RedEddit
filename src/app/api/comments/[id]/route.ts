import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
import { fetchComments } from '@/lib/reddit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const subreddit = req.nextUrl.searchParams.get('subreddit') ?? '';

  if (!subreddit) {
    return NextResponse.json({ error: 'subreddit param required' }, { status: 400 });
  }

  try {
    const data = await fetchComments(subreddit, id);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
