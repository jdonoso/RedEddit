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

const NEW_TIMES: { value: TopTime; label: string }[] = [
  { value: '4h',   label: '4h' },
  { value: '12h',  label: '12h' },
  { value: 'day',  label: '1d' },
  { value: 'week', label: '1w' },
];

const NEW_TIME_VALUES = new Set<TopTime>(NEW_TIMES.map(t => t.value));

export default function SortBar({ sort, time, onChange, mode, onModeToggle }: Props) {
  return (
    <div className={styles.bar}>
      <span className={styles.label}>sorted by:</span>
      {SORTS.map(s => (
        <button
          key={s.value}
          className={`${styles.btn} ${sort === s.value ? styles.active : ''}`}
          onClick={() => onChange(s.value, NEW_TIME_VALUES.has(time) ? time : 'day')}
        >
          {s.label}
        </button>
      ))}
      <span className={styles.newTimes}>
        {NEW_TIMES.map(t => (
          <button
            key={t.value}
            className={`${styles.btn} ${time === t.value ? styles.active : ''}`}
            onClick={() => onChange(sort, t.value)}
          >
            {t.label}
          </button>
        ))}
      </span>
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
