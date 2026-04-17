'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { RedditPost } from '@/types/reddit';
import { ratePost, getPostRating, Rating } from '@/lib/ratings';
import { markSeen, isSeen } from '@/lib/history';
import styles from './PostRow.module.css';

interface Props {
  post: RedditPost;
}

function timeAgo(utc: number): string {
  const secs = Math.floor(Date.now() / 1000) - utc;
  if (secs < 60) return `${secs} seconds ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)} minutes ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)} hours ago`;
  return `${Math.floor(secs / 86400)} days ago`;
}

function formatScore(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function PostRow({ post }: Props) {
  const commentsUrl = `/r/${post.subreddit}/comments/${post.id}`;
  const isExternal = !post.is_self;

  const [rating, setRating] = useState<Rating | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    setRating(getPostRating(post.id));
    setSeen(isSeen(post.id));
  }, [post.id]);

  const handleRating = useCallback((r: Rating) => {
    const next = rating === r ? null : r;
    ratePost({
      id: post.id,
      title: post.title,
      subreddit: post.subreddit,
      author: post.author,
      domain: post.domain,
    }, next);
    setRating(next);
  }, [rating, post]);

  const handleClick = useCallback(() => {
    markSeen(post.id);
    setSeen(true);
  }, [post.id]);

  return (
    <div className={`${styles.row} ${seen ? styles.seen : ''}`}>
      <div className={styles.score}>
        <span className={styles.scoreNum}>{formatScore(post.score)}</span>
      </div>
      <div className={styles.body}>
        <p className={styles.title}>
          {isExternal ? (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.titleLink}
              onClick={handleClick}
            >
              {post.title}
            </a>
          ) : (
            <Link href={commentsUrl} className={styles.titleLink} onClick={handleClick}>
              {post.title}
            </Link>
          )}
          {isExternal && (
            <span className={styles.domain}> ({post.domain})</span>
          )}
          {post.link_flair_text && (
            <span className={styles.flair}>{post.link_flair_text}</span>
          )}
        </p>
        <p className={styles.meta}>
          submitted {timeAgo(post.created_utc)} by{' '}
          <span className={styles.author}>{post.author}</span>
          {' '}to{' '}
          <Link href={`/r/${post.subreddit}`} className={styles.subreddit}>
            r/{post.subreddit}
          </Link>
          {' | '}
          <Link href={commentsUrl} className={styles.comments} onClick={handleClick}>
            {post.num_comments} comment{post.num_comments !== 1 ? 's' : ''}
          </Link>
          <span className={styles.ratingButtons}>
            <button
              className={`${styles.rateBtn} ${rating === 'like' ? styles.liked : ''}`}
              onClick={() => handleRating('like')}
              title="I like this"
            >
              ▲
            </button>
            <button
              className={`${styles.rateBtn} ${rating === 'dislike' ? styles.disliked : ''}`}
              onClick={() => handleRating('dislike')}
              title="Not for me"
            >
              ▼
            </button>
          </span>
        </p>
      </div>
    </div>
  );
}
