'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubreddits, saveSubreddits } from '@/lib/subreddits';
import styles from './page.module.css';

interface SubPreview {
  title: string;
  score: number;
}

interface DiscoverResult {
  suggestions: string[];
  previews: Record<string, SubPreview[]>;
}

function formatScore(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function DiscoverPage() {
  const [result, setResult] = useState<DiscoverResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [userSubs, setUserSubs] = useState<string[]>([]);

  useEffect(() => {
    const subs = getSubreddits();
    setUserSubs(subs);
    const params = new URLSearchParams({ subs: subs.join(',') });
    fetch(`/api/discover?${params}`)
      .then(r => r.json())
      .then(data => setResult(data))
      .finally(() => setLoading(false));
  }, []);

  function handleAdd(sub: string) {
    const updated = [...userSubs, sub.toLowerCase()];
    saveSubreddits(updated);
    setUserSubs(updated);
    setAdded(prev => new Set([...prev, sub]));
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

  const { suggestions = [], previews = {} } = result ?? {};

  return (
    <div className="page-wrap">
      <main className="page-main">
        <h1 className="page-title">discover subreddits</h1>
        <p className={styles.intro}>
          Based on your subscribed subreddits, here are some you might enjoy.
          Click <strong>+ subscribe</strong> to add them to your front page.
        </p>

        {suggestions.length === 0 ? (
          <div className={styles.empty}>
            No suggestions found. Try subscribing to more subreddits in{' '}
            <Link href="/settings">settings</Link>.
          </div>
        ) : (
          <div className={styles.grid}>
            {suggestions.map(sub => {
              const isAdded = added.has(sub) || userSubs.map(s => s.toLowerCase()).includes(sub.toLowerCase());
              const preview = previews[sub] ?? [];

              return (
                <div key={sub} className={`${styles.card} ${isAdded ? styles.cardAdded : ''}`}>
                  <div className={styles.cardHeader}>
                    <Link href={`/r/${sub}`} className={styles.subName}>
                      r/{sub}
                    </Link>
                    <button
                      className={`${styles.addBtn} ${isAdded ? styles.addedBtn : ''}`}
                      onClick={() => !isAdded && handleAdd(sub)}
                      disabled={isAdded}
                    >
                      {isAdded ? '✓ subscribed' : '+ subscribe'}
                    </button>
                  </div>
                  {preview.length > 0 && (
                    <ul className={styles.preview}>
                      {preview.map((p, i) => (
                        <li key={i} className={styles.previewItem}>
                          <span className={styles.previewScore}>{formatScore(p.score)}</span>
                          <span className={styles.previewTitle}>{p.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <aside className={styles.sidebar}>
        <div className={styles.sideBox}>
          <h3 className={styles.sideTitle}>how discovery works</h3>
          <p className={styles.sideText}>
            Suggestions come from a curated similarity map of golden-era subreddits,
            plus Reddit&apos;s own search results. All filters still apply when you
            browse these subs.
          </p>
          <Link href="/settings" className={styles.sideLink}>manage my subreddits →</Link>
        </div>
      </aside>
    </div>
  );
}
