'use client';

import { useEffect, useState, useCallback } from 'react';
import PostList from '@/components/PostList';
import Pagination from '@/components/Pagination';
import SortBar from '@/components/SortBar';
import Sidebar from '@/components/Sidebar';
import { RedditPost, FilterSettings } from '@/types/reddit';
import { getSubreddits } from '@/lib/subreddits';
import { getFilterSettings } from '@/lib/filters';
import { SortType, TopTime } from '@/lib/reddit';
import { getMode, setMode, AppMode, LIGHT_MODE_SUBREDDITS, LIGHT_MODE_FILTERS } from '@/lib/modes';

function getActiveSubs(mode: AppMode): string[] {
  return mode === 'light' ? LIGHT_MODE_SUBREDDITS : getSubreddits();
}

function getActiveFilters(mode: AppMode): FilterSettings {
  return mode === 'light' ? LIGHT_MODE_FILTERS : getFilterSettings();
}

export default function HomePage() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [sort, setSort] = useState<SortType>('hot');
  const [time, setTime] = useState<TopTime>('week');
  const [mode, setModeState] = useState<AppMode>('serious');
  useEffect(() => {
    setModeState(getMode());
    const handler = (e: Event) => {
      const newMode = (e as CustomEvent<AppMode>).detail;
      setModeState(newMode);
      setCursors([null]);
      setCurrentPage(1);
    };
    window.addEventListener('rededit-mode-change', handler);
    return () => window.removeEventListener('rededit-mode-change', handler);
  }, []);

  const fetchPage = useCallback(async (cursor: string | null, s: SortType, t: TopTime, m: AppMode) => {
    setLoading(true);
    try {
      const subs = getActiveSubs(m);
      const filters = getActiveFilters(m);
      const params = new URLSearchParams({
        filters: JSON.stringify(filters),
        subs: subs.join(','),
        sort: s,
        time: t,
      });
      if (cursor) params.set('after', cursor);

      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts ?? []);
      setAfterCursor(data.after ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(null, sort, time, mode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function handleModeToggle() {
    const next: AppMode = mode === 'serious' ? 'light' : 'serious';
    setMode(next);
  }

  function handleSortChange(newSort: SortType, newTime: TopTime) {
    setSort(newSort);
    setTime(newTime);
    setCurrentPage(1);
    setCursors([null]);
    fetchPage(null, newSort, newTime, mode);
  }

  function handlePageChange(page: number, cursor: string | null) {
    setCurrentPage(page);
    fetchPage(cursor, sort, time, mode);
    window.scrollTo(0, 0);
  }

  function handleNext() {
    const nextPage = currentPage + 1;
    const newCursors = [...cursors];
    if (newCursors.length < nextPage) newCursors.push(afterCursor);
    setCursors(newCursors);
    setCurrentPage(nextPage);
    fetchPage(afterCursor, sort, time, mode);
    window.scrollTo(0, 0);
  }

  const [title, setTitle] = useState('front page');
  useEffect(() => {
    if (mode === 'light') { setTitle('light mode — humor & fun'); return; }
    const subs = getActiveSubs(mode);
    setTitle(subs.length <= 3 ? subs.map(s => `r/${s}`).join(' + ') : 'front page');
  }, [mode]);

  return (
    <div className="page-wrap">
      <main className="page-main">
        <h1 className="page-title">{title}</h1>
        <SortBar sort={sort} time={time} onChange={handleSortChange} mode={mode} onModeToggle={handleModeToggle} />
        <PostList posts={posts} loading={loading} source={mode === 'light' ? 'light' : 'feed'} />
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
      <Sidebar
        title={mode === 'light' ? 'light mode' : 'RedEddit'}
        description={mode === 'light' ? 'Humor, wholesome content, and light reading. No doom, no politics.' : 'Hot posts from your subscribed subreddits, filtered for quality.'}
      />
    </div>
  );
}
