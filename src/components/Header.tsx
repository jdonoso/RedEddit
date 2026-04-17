'use client';

import Link from 'next/link';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getMode, AppMode } from '@/lib/modes';
import styles from './Header.module.css';

export default function Header() {
  const [query, setQuery] = useState('');
  const [mode, setModeState] = useState<AppMode>('serious');
  const router = useRouter();

  useEffect(() => {
    setModeState(getMode());
    const handler = (e: Event) => setModeState((e as CustomEvent<AppMode>).detail);
    window.addEventListener('rededit-mode-change', handler);
    return () => window.removeEventListener('rededit-mode-change', handler);
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const sub = query.trim().replace(/^r\//, '');
    if (sub) router.push(`/r/${sub}`);
  }

  return (
    <header className={`${styles.header} ${mode === 'light' ? styles.lightHeader : ''}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>RedEddit</span>
          <span className={styles.logoSub}>
            {mode === 'light' ? 'light & funny mode' : 'the front page of the internet (circa 2010)'}
          </span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/">hot</Link>
          <Link href="/discover">discover</Link>
          <Link href="/stats">my ratings</Link>
          <Link href="/settings">settings</Link>
        </nav>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="search subreddits…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className={styles.searchBtn} type="submit">go</button>
        </form>
      </div>
    </header>
  );
}
