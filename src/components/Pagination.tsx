'use client';

import styles from './Pagination.module.css';

interface Props {
  currentPage: number;
  cursors: (string | null)[]; // cursors[0] = null (page 1), cursors[1] = after for page 2, etc.
  onPageChange: (page: number, cursor: string | null) => void;
  hasNext: boolean;
  nextCursor: string | null;
  onNext: () => void;
}

export default function Pagination({
  currentPage,
  cursors,
  onPageChange,
  hasNext,
  nextCursor,
  onNext,
}: Props) {
  const totalKnown = cursors.length;

  // Show window of 5 pages around current
  const windowStart = Math.max(1, currentPage - 2);
  const windowEnd = Math.min(totalKnown, windowStart + 4);
  const pages = Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i);

  return (
    <div className={styles.pagination}>
      {currentPage > 1 && (
        <button
          className={styles.btn}
          onClick={() => onPageChange(currentPage - 1, cursors[currentPage - 2])}
        >
          ‹ prev
        </button>
      )}

      {pages.map(page => (
        <button
          key={page}
          className={`${styles.btn} ${page === currentPage ? styles.active : ''}`}
          onClick={() => onPageChange(page, cursors[page - 1])}
        >
          {page}
        </button>
      ))}

      {hasNext && (
        <button className={styles.btn} onClick={onNext}>
          next ›
        </button>
      )}
    </div>
  );
}
