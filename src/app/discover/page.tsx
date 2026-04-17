'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubreddits, saveSubreddits } from '@/lib/subreddits';
import { getStatsBySubreddit, getRatings, ratePost, Rating } from '@/lib/ratings';
import { DiscoverResult } from '@/app/api/discover/route';
import { getSuggestionsForSubs, RatedSubInfo } from '@/lib/discovery';
import { searchSubreddits, fetchPosts } from '@/lib/reddit';
import { RedditPost } from '@/types/reddit';
import styles from './page.module.css';

interface DiscoverFeedPost {
  post: RedditPost;
  qualityScore: number;
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

export default function DiscoverPage() {
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribedSet, setSubscribedSet] = useState<Set<string>>(new Set());
  const [userSubs, setUserSubs] = useState<string[]>([]);
  const [postRatings, setPostRatings] = useState<Record<string, Rating>>({});
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const subs = getSubreddits();
    setUserSubs(subs);
    setSubscribedSet(new Set(subs.map(s => s.toLowerCase())));

    const stats = getStatsBySubreddit();
    const ratedSubs: RatedSubInfo[] = stats.map(s => ({
      subreddit: s.subreddit,
      likes: s.likes,
      dislikes: s.dislikes,
      ratio: s.ratio,
    }));

    const stored = getRatings();
    const initial: Record<string, Rating> = {};
    for (const [id, r] of Object.entries(stored)) initial[id] = r.rating;
    setPostRatings(initial);

    async function loadDiscover() {
      const curated = getSuggestionsForSubs(subs, ratedSubs);

      const likedSubNames = ratedSubs.filter(r => r.ratio >= 0.6).map(r => r.subreddit).slice(0, 3);
      const searchSeeds = likedSubNames.length > 0 ? likedSubNames : subs.slice(0, 3);
      let searchResults: string[] = [];
      if (searchSeeds.length > 0) {
        searchResults = await searchSubreddits(searchSeeds.join(' '));
      }

      const subsLower = new Set(subs.map(s => s.toLowerCase()));
      const dislikedLower = new Set(
        ratedSubs.filter(r => r.ratio <= 0.3 && r.dislikes >= 2).map(r => r.subreddit.toLowerCase())
      );
      const suggestedSubs = [...curated, ...searchResults]
        .filter(s => !subsLower.has(s.toLowerCase()))
        .filter(s => !dislikedLower.has(s.toLowerCase()))
        .filter((s, i, arr) => arr.findIndex(x => x.toLowerCase() === s.toLowerCase()) === i)
        .slice(0, 40);

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

      const feed: DiscoverFeedPost[] = allPosts
        .filter(p => !p.stickied && !p.over_18)
        .map(p => ({ post: p, qualityScore: p.score * (p.upvote_ratio ?? 1) }))
        .sort((a, b) => b.qualityScore - a.qualityScore)
        .filter((item, i, arr) => arr.findIndex(x => x.post.id === item.post.id) === i)
        .slice(0, 60);

      setResult({ feed, suggestedSubs });
      setLoading(false);
    }

    loadDiscover();
  }, []);

  function handleRate(postId: string, rating: Rating, post: { title: string; subreddit: string; author: string; domain: string }) {
    const next = postRatings[postId] === rating ? null : rating;
    ratePost({ id: postId, ...post }, next, 'discover');
    setPostRatings(prev => {
      const updated = { ...prev };
      if (next === null) delete updated[postId];
      else updated[postId] = next;
      return updated;
    });
  }

  function handleSubscribe(sub: string) {
    const updated = [...userSubs, sub.toLowerCase()];
    saveSubreddits(updated);
    setUserSubs(updated);
    setSubscribedSet(prev => new Set([...prev, sub.toLowerCase()]));
  }

  if (loading) {
    return (
      <div className="page-wrap">
        <main className="page-main">
          <h1 className="page-title">discover</h1>
          <div className={styles.loading}>Casting a wide net…</div>
        </main>
      </div>
    );
  }

  const { feed = [], suggestedSubs = [] } = result ?? {};
  const totalPages = Math.ceil(feed.length / PAGE_SIZE);
  const pageFeed = feed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="page-wrap">
      <main className="page-main">
        <h1 className="page-title">discover</h1>
        <p className={styles.intro}>
          The best posts from communities you haven't found yet — ranked by quality, not just popularity.
          Subscribe to any that catch your eye.
        </p>

        {feed.length === 0 ? (
          <div className={styles.empty}>
            No discoveries found. Try subscribing to more subreddits in{' '}
            <Link href="/settings">settings</Link> or rating posts to improve suggestions.
          </div>
        ) : (
          <div className={styles.feed}>
            {pageFeed.map(({ post }, i) => {
              const rank = (page - 1) * PAGE_SIZE + i + 1;
              const subLower = post.subreddit.toLowerCase();
              const isSubscribed = subscribedSet.has(subLower);
              const commentsUrl = `/r/${post.subreddit}/comments/${post.id}`;
              return (
                <div key={post.id} className={styles.feedRow}>
                  <span className={styles.rank}>{rank}</span>
                  <span className={styles.score}>{formatScore(post.score)}</span>
                  <div className={styles.body}>
                    <div className={styles.titleLine}>
                      {post.is_self ? (
                        <Link href={commentsUrl} className={styles.title}>{post.title}</Link>
                      ) : (
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.title}>
                          {post.title}
                        </a>
                      )}
                      {!post.is_self && <span className={styles.domain}> ({post.domain})</span>}
                    </div>
                    <div className={styles.meta}>
                      <Link href={`/r/${post.subreddit}`} className={styles.subBadge}>
                        r/{post.subreddit}
                      </Link>
                      <span className={styles.metaDot}>·</span>
                      <span className={styles.metaText}>{timeAgo(post.created_utc)}</span>
                      <span className={styles.metaDot}>·</span>
                      <Link href={commentsUrl} className={styles.comments}>
                        {post.num_comments} comments
                      </Link>
                      <span className={styles.metaDot}>·</span>
                      <span className={styles.ratingBtns}>
                        <button
                          className={`${styles.rateBtn} ${postRatings[post.id] === 'like' ? styles.rateLiked : ''}`}
                          onClick={() => handleRate(post.id, 'like', { title: post.title, subreddit: post.subreddit, author: post.author, domain: post.domain })}
                          title="I like this"
                        >▲</button>
                        <button
                          className={`${styles.rateBtn} ${postRatings[post.id] === 'dislike' ? styles.rateDisliked : ''}`}
                          onClick={() => handleRate(post.id, 'dislike', { title: post.title, subreddit: post.subreddit, author: post.author, domain: post.domain })}
                          title="Not for me"
                        >▼</button>
                      </span>
                      <span className={styles.metaDot}>·</span>
                      <button
                        className={`${styles.subBtn} ${isSubscribed ? styles.subBtnDone : ''}`}
                        onClick={() => !isSubscribed && handleSubscribe(post.subreddit)}
                        disabled={isSubscribed}
                      >
                        {isSubscribed ? '✓ subscribed' : '+ subscribe'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
              disabled={page === 1}
            >
              ‹ prev
            </button>
            <span className={styles.pageInfo}>page {page} of {totalPages}</span>
            <button
              className={styles.pageBtn}
              onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
              disabled={page === totalPages}
            >
              next ›
            </button>
          </div>
        )}
      </main>

      <aside className={styles.sidebar}>
        {suggestedSubs.length > 0 && (
          <div className={styles.sideBox}>
            <h3 className={styles.sideTitle}>suggested communities</h3>
            <div className={styles.subList}>
              {suggestedSubs.map(sub => {
                const isSubscribed = subscribedSet.has(sub.toLowerCase());
                return (
                  <div key={sub} className={styles.subRow}>
                    <Link href={`/r/${sub}`} className={styles.subLink}>r/{sub}</Link>
                    <button
                      className={`${styles.subBtn} ${isSubscribed ? styles.subBtnDone : ''}`}
                      onClick={() => !isSubscribed && handleSubscribe(sub)}
                      disabled={isSubscribed}
                    >
                      {isSubscribed ? '✓' : '+'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className={styles.sideBox}>
          <h3 className={styles.sideTitle}>how it works</h3>
          <p className={styles.sideText}>
            Pulls top/week posts from 40+ candidate communities, scores each by{' '}
            <em>upvotes × approval ratio</em>, and surfaces only the genuine standouts.
            Your ratings shape which communities get sampled.
          </p>
          <Link href="/stats" className={styles.sideLink}>view my ratings →</Link>
          <Link href="/settings" className={styles.sideLink} style={{ marginTop: 6 }}>manage subreddits →</Link>
        </div>
      </aside>
    </div>
  );
}
