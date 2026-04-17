'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStatsBySubreddit, SubredditStats, getRatings } from '@/lib/ratings';
import { clearHistory } from '@/lib/history';
import styles from './page.module.css';

export default function StatsPage() {
  const [stats, setStats] = useState<SubredditStats[]>([]);
  const [totalRatings, setTotalRatings] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const s = getStatsBySubreddit();
    setStats(s);
    setTotalRatings(Object.keys(getRatings()).length);
  }, []);

  function handleClearHistory() {
    if (confirm('Clear all seen post history?')) {
      clearHistory();
      alert('History cleared.');
    }
  }

  if (stats.length === 0) {
    return (
      <div className="page-wrap">
        <main className="page-main">
          <h1 className="page-title">my ratings</h1>
          <div className={styles.empty}>
            No ratings yet. Use the ▲ / ▼ buttons on any post to rate it.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <main className="page-main">
        <h1 className="page-title">my ratings</h1>
        <p className={styles.summary}>
          {totalRatings} post{totalRatings !== 1 ? 's' : ''} rated across {stats.length} subreddit{stats.length !== 1 ? 's' : ''}
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>subreddit</th>
              <th className={styles.numCol}>liked</th>
              <th className={styles.numCol}>disliked</th>
              <th className={styles.numCol}>ratio</th>
              <th className={styles.actionCol}>action</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => (
              <>
                <tr key={s.subreddit} className={styles.subRow}>
                  <td>
                    <button
                      className={styles.expandBtn}
                      onClick={() => setExpanded(expanded === s.subreddit ? null : s.subreddit)}
                    >
                      {expanded === s.subreddit ? '▾' : '▸'}
                    </button>
                    <Link href={`/r/${s.subreddit}`} className={styles.subLink}>
                      r/{s.subreddit}
                    </Link>
                  </td>
                  <td className={`${styles.numCol} ${styles.likeNum}`}>{s.likes}</td>
                  <td className={`${styles.numCol} ${styles.dislikeNum}`}>{s.dislikes}</td>
                  <td className={styles.numCol}>
                    <span
                      className={styles.ratio}
                      style={{ color: s.ratio >= 0.6 ? '#3a7a3a' : s.ratio <= 0.4 ? '#a03030' : '#888' }}
                    >
                      {Math.round(s.ratio * 100)}%
                    </span>
                  </td>
                  <td className={styles.actionCol}>
                    <Link href="/settings" className={styles.actionLink}>remove sub</Link>
                  </td>
                </tr>
                {expanded === s.subreddit && (
                  <tr key={`${s.subreddit}-posts`}>
                    <td colSpan={5} className={styles.expandedCell}>
                      <div className={styles.postList}>
                        {s.posts.map(p => (
                          <div key={p.id} className={`${styles.postItem} ${p.rating === 'like' ? styles.postLiked : styles.postDisliked}`}>
                            <span className={styles.postRating}>{p.rating === 'like' ? '▲' : '▼'}</span>
                            <span className={styles.postSource}>{p.source ?? 'feed'}</span>
                            <a href={`/r/${p.subreddit}/comments/${p.id}`} className={styles.postTitle}>
                              {p.title}
                            </a>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        <div className={styles.danger}>
          <h3 className={styles.dangerTitle}>data management</h3>
          <button className={styles.clearBtn} onClick={handleClearHistory}>
            clear seen post history
          </button>
        </div>
      </main>
      <aside />
    </div>
  );
}
