'use client';

import { SortType, TopTime } from '@/lib/reddit';
import { AppMode } from '@/lib/modes';
import styles from './SortBar.module.css';

interface Props {
  sort: SortType;
  time: TopTime;
  onChange: (sort: SortType, time: TopTime) => void;
  mode?: AppMode;
  onModeToggle?: () => void;
}

const SORTS: { value: SortType; label: string }[] = [
  { value: 'hot', label: 'hot' },
  { value: 'new', label: 'new' },
  { value: 'top', label: 'top' },
];

const TIMES: { value: TopTime; label: string }[] = [
  { value: 'hour', label: 'past hour' },
  { value: 'day', label: 'today' },
  { value: 'week', label: 'this week' },
  { value: 'month', label: 'this month' },
  { value: 'year', label: 'this year' },
  { value: 'all', label: 'all time' },
];

export default function SortBar({ sort, time, onChange, mode, onModeToggle }: Props) {
  return (
    <div className={styles.bar}>
      <span className={styles.label}>sorted by:</span>
      {SORTS.map(s => (
        <button
          key={s.value}
          className={`${styles.btn} ${sort === s.value ? styles.active : ''}`}
          onClick={() => onChange(s.value, time)}
        >
          {s.label}
        </button>
      ))}
      {sort === 'top' && (
        <select
          className={styles.timeSelect}
          value={time}
          onChange={e => onChange('top', e.target.value as TopTime)}
        >
          {TIMES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      )}
      {onModeToggle && (
        <>
          <span className={styles.divider}>|</span>
          <button
            className={`${styles.modeBtn} ${mode === 'light' ? styles.modeLightActive : ''}`}
            onClick={onModeToggle}
            title={mode === 'light' ? 'Switch to serious mode' : 'Switch to humor/light mode'}
          >
            {mode === 'light' ? '😄 light mode' : '🎭 go light'}
          </button>
        </>
      )}
    </div>
  );
}
