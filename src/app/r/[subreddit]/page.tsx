'use client';

import { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import PostList from '@/components/PostList';
import Pagination from '@/components/Pagination';
import SortBar from '@/components/SortBar';
import Sidebar from '@/components/Sidebar';
import { RedditPost, FilterSettings } from '@/types/reddit';
import { getFilterSettings } from '@/lib/filters';
import { SortType, TopTime } from '@/lib/reddit';

interface Props {
  params: Promise<{ subreddit: string }>;
}

export default function SubredditPage({ params }: Props) {
  const { subreddit } = use(params);

  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [sort, setSort] = useState<SortType>('hot');
  const [time, setTime] = useState<TopTime>('week');
  const fetchPage = useCallback(async (cursor: string | null, s: SortType, t: TopTime) => {
    setLoading(true);
    try {
      const filters: FilterSettings = getFilterSettings();
      const urlParams = new URLSearchParams({
        subs: subreddit,
        filters: JSON.stringify(filters),
        sort: s,
        time: t,
      });
      if (cursor) urlParams.set('after', cursor);

      const res = await fetch(`/api/posts?${urlParams}`);
      const data = await res.json();
      setPosts(data.posts ?? []);
      setAfterCursor(data.after ?? null);
    } finally {
      setLoading(false);
    }
  }, [subreddit]);

  useEffect(() => {
    setCurrentPage(1);
    setCursors([null]);
    fetchPage(null, sort, time);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPage]);

  function handleSortChange(newSort: SortType, newTime: TopTime) {
    setSort(newSort);
    setTime(newTime);
    setCurrentPage(1);
    setCursors([null]);
    fetchPage(null, newSort, newTime);
  }

  function handlePageChange(page: number, cursor: string | null) {
    setCurrentPage(page);
    fetchPage(cursor, sort, time);
    window.scrollTo(0, 0);
  }

  function handleNext() {
    const nextPage = currentPage + 1;
    const newCursors = [...cursors];
    if (newCursors.length < nextPage) newCursors.push(afterCursor);
    setCursors(newCursors);
    setCurrentPage(nextPage);
    fetchPage(afterCursor, sort, time);
    window.scrollTo(0, 0);
  }

  return (
    <div className="page-wrap">
      <main className="page-main">
        <h1 className="page-title">r/{subreddit}</h1>
        <SortBar sort={sort} time={time} onChange={handleSortChange} />
        <PostList posts={posts} loading={loading} source="feed" />
        {!loading && (
          <Pagination
            currentPage={currentPage}
            cursors={cursors}
            onPageChange={handlePageChange}
            hasNext={!!afterCursor}
            nextCursor={afterCursor}
            onNext={handleNext}
          />
        )}
      </main>
      <Sidebar title={`r/${subreddit}`} />
    </div>
  );
}
