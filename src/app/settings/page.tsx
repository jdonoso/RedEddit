'use client';

import { useEffect, useState } from 'react';
import { getSubreddits, saveSubreddits, DEFAULT_SUBREDDITS } from '@/lib/subreddits';
import { getFilterSettings, saveFilterSettings, DEFAULT_FILTER_SETTINGS } from '@/lib/filters';
import { FilterSettings } from '@/types/reddit';
import styles from './page.module.css';

export default function SettingsPage() {
  const [subs, setSubs] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTER_SETTINGS);
  const [newSub, setNewSub] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSubs(getSubreddits());
    setFilters(getFilterSettings());
  }, []);

  function addSub() {
    const sub = newSub.trim().replace(/^r\//, '').toLowerCase();
    if (sub && !subs.includes(sub)) {
      setSubs([...subs, sub]);
    }
    setNewSub('');
  }

  function removeSub(sub: string) {
    setSubs(subs.filter(s => s !== sub));
  }

  function toggleFilter(key: keyof FilterSettings) {
    setFilters(f => ({ ...f, [key]: !f[key] }));
  }

  function handleSave() {
    saveSubreddits(subs);
    saveFilterSettings(filters);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setSubs([...DEFAULT_SUBREDDITS]);
    setFilters({ ...DEFAULT_FILTER_SETTINGS });
  }

  return (
    <div className="page-wrap">
      <main className="page-main">
        <h1 className="page-title">settings</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>my subreddits</h2>
          <div className={styles.subList}>
            {subs.map(sub => (
              <div key={sub} className={styles.subRow}>
                <span className={styles.subName}>r/{sub}</span>
                <button className={styles.removeBtn} onClick={() => removeSub(sub)}>
                  remove
                </button>
              </div>
            ))}
          </div>
          <div className={styles.addRow}>
            <input
              className={styles.addInput}
              type="text"
              placeholder="subreddit name or r/name"
              value={newSub}
              onChange={e => setNewSub(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSub()}
            />
            <button className={styles.addBtn} onClick={addSub}>add</button>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>content filters</h2>
          <label className={styles.filterRow}>
            <input
              type="checkbox"
              checked={filters.filterPolitics}
              onChange={() => toggleFilter('filterPolitics')}
            />
            <div>
              <strong>Filter politics</strong>
              <p>Hide posts about politicians, elections, and political news.</p>
            </div>
          </label>
          <label className={styles.filterRow}>
            <input
              type="checkbox"
              checked={filters.filterLowEffort}
              onChange={() => toggleFilter('filterLowEffort')}
            />
            <div>
              <strong>Filter low-effort image posts</strong>
              <p>Hide image posts with fewer than 10 comments.</p>
            </div>
          </label>
          <label className={styles.filterRow}>
            <input
              type="checkbox"
              checked={filters.filterRepetitive}
              onChange={() => toggleFilter('filterRepetitive')}
            />
            <div>
              <strong>Filter repetitive meme formats</strong>
              <p>Hide posts matching common meme templates (Nobody:, POV:, when you, etc).</p>
            </div>
          </label>
        </section>

        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave}>
            {saved ? 'saved!' : 'save settings'}
          </button>
          <button className={styles.resetBtn} onClick={handleReset}>
            reset to defaults
          </button>
        </div>
      </main>
      <aside />
    </div>
  );
}
