'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubreddits, saveSubreddits } from '@/lib/subreddits';
import { getStatsBySubreddit } from '@/lib/ratings';
import { RedditPost } from '@/types/reddit';
import styles from './page.module.css';

interface DiscoverResult {
  suggestions: string[];
  posts: Record<string, RedditPost[]>;
}

function timeAgo(utc: number): string {
  const secs = Math.floor(Date.now() / 1000) - utc;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function formatScore(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function SubCard({ sub, posts, isSubscribed, onAdd }: {
  sub: string;
  posts: RedditPost[];
  isSubscribed: boolean;
  onAdd: (sub: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`${styles.card} ${isSubscribed ? styles.cardAdded : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardLeft}>
          <button className={styles.expandBtn} onClick={() => setExpanded(e => !e)}>
            {expanded ? '▾' : '▸'}
          </button>
          <Link href={`/r/${sub}`} className={styles.subName}>r/{sub}</Link>
          <span className={styles.postCount}>{posts.length} posts</span>
        </div>
        <button
          className={`${styles.addBtn} ${isSubscribed ? styles.addedBtn : ''}`}
          onClick={() => !isSubscribed && onAdd(sub)}
          disabled={isSubscribed}
        >
          {isSubscribed ? '✓ subscribed' : '+ subscribe'}
        </button>
      </div>

      {/* Always show top 2 posts as a tease */}
      {posts.slice(0, 2).map(post => (
        <PostPreviewRow key={post.id} post={post} sub={sub} />
      ))}

      {/* Expanded: show remaining posts */}
      {expanded && posts.slice(2).map(post => (
        <PostPreviewRow key={post.id} post={post} sub={sub} />
      ))}

      {posts.length > 2 && (
        <button className={styles.showMore} onClick={() => setExpanded(e => !e)}>
          {expanded ? '▲ show less' : `▼ show ${posts.length - 2} more posts`}
        </button>
      )}
    </div>
  );
}

function PostPreviewRow({ post, sub }: { post: RedditPost; sub: string }) {
  const commentsUrl = `/r/${sub}/comments/${post.id}`;
  return (
    <div className={styles.postRow}>
      <span className={styles.postScore}>{formatScore(post.score)}</span>
      <div className={styles.postBody}>
        {post.is_self ? (
          <Link href={commentsUrl} className={styles.postTitle}>{post.title}</Link>
        ) : (
          <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.postTitle}>
            {post.title}
          </a>
        )}
        {!post.is_self && <span className={styles.postDomain}> ({post.domain})</span>}
        <span className={styles.postMeta}>
          {' '}{timeAgo(post.created_utc)} · {' '}
          <Link href={commentsUrl} className={styles.postComments}>
            {post.num_comments} comments
          </Link>
        </span>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSubs, setUserSubs] = useState<string[]>([]);
  const [subscribedSet, setSubscribedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const subs = getSubreddits();
    setUserSubs(subs);
    setSubscribedSet(new Set(subs.map(s => s.toLowerCase())));

    const stats = getStatsBySubreddit();
    const ratingsParam = JSON.stringify(stats.map(s => ({
      subreddit: s.subreddit,
      likes: s.likes,
      dislikes: s.dislikes,
      ratio: s.ratio,
    })));

    const params = new URLSearchParams({ subs: subs.join(','), ratings: ratingsParam });
    fetch(`/api/discover?${params}`)
      .then(r => r.json())
      .then(data => setResult(data))
      .finally(() => setLoading(false));
  }, []);

  function handleAdd(sub: string) {
    const updated = [...userSubs, sub.toLowerCase()];
    saveSubreddits(updated);
    setUserSubs(updated);
    setSubscribedSet(prev => new Set([...prev, sub.toLowerCase()]));
  }

  if (loading) {
    return (
      <div className="page-wrap">
        <main className="page-main">
          <h1 className="page-title">discover subreddits</h1>
          <div className={styles.loading}>Finding subreddits you might like…</div>
        </main>
      </div>
    );
  }

  const { suggestions = [], posts = {} } = result ?? {};

  return (
    <div className="page-wrap">
      <main className="page-main">
        <h1 className="page-title">discover subreddits</h1>
        <p className={styles.intro}>
          Suggestions based on your subscribed subreddits and ratings.
          Browse the posts below to get a feel for each community, then click <strong>+ subscribe</strong>.
        </p>

        {suggestions.length === 0 ? (
          <div className={styles.empty}>
            No suggestions found. Try subscribing to more subreddits in{' '}
            <Link href="/settings">settings</Link>.
          </div>
        ) : (
          <div className={styles.grid}>
            {suggestions.map(sub => (
              <SubCard
                key={sub}
                sub={sub}
                posts={posts[sub] ?? []}
                isSubscribed={subscribedSet.has(sub.toLowerCase())}
                onAdd={handleAdd}
              />
            ))}
          </div>
        )}
      </main>
      <aside className={styles.sidebar}>
        <div className={styles.sideBox}>
          <h3 className={styles.sideTitle}>how discovery works</h3>
          <p className={styles.sideText}>
            Suggestions come from a curated similarity map weighted by your ratings —
            liked subs surface more of their neighbors, disliked subs are suppressed.
            Reddit search fills any gaps.
          </p>
          <Link href="/stats" className={styles.sideLink}>view my ratings →</Link>
          <Link href="/settings" className={styles.sideLink} style={{ marginTop: 6 }}>manage my subreddits →</Link>
        </div>
      </aside>
    </div>
  );
}
