'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import CommentThread from '@/components/CommentThread';
import { RedditPost, RedditComment } from '@/types/reddit';
import styles from './page.module.css';

interface Props {
  params: Promise<{ subreddit: string; id: string }>;
}

function timeAgo(utc: number): string {
  const secs = Math.floor(Date.now() / 1000) - utc;
  if (secs < 3600) return `${Math.floor(secs / 60)} minutes ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)} hours ago`;
  return `${Math.floor(secs / 86400)} days ago`;
}

export default function CommentsPage({ params }: Props) {
  const { subreddit, id } = use(params);
  const [post, setPost] = useState<RedditPost | null>(null);
  const [comments, setComments] = useState<RedditComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/comments/${id}?subreddit=${subreddit}`);
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setPost(data.post);
        setComments(data.comments);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, subreddit]);

  if (loading) return <div className={styles.loading}>loading…</div>;
  if (error || !post) return <div className={styles.error}>error loading post</div>;

  return (
    <div className="page-wrap">
      <main className="page-main">
        <div className={styles.postBox}>
          <div className={styles.postScore}>{post.score}</div>
          <div className={styles.postBody}>
            <h1 className={styles.postTitle}>
              {post.is_self ? (
                post.title
              ) : (
                <a href={post.url} target="_blank" rel="noopener noreferrer">
                  {post.title}
                </a>
              )}
            </h1>
            <p className={styles.postMeta}>
              submitted {timeAgo(post.created_utc)} by{' '}
              <span className={styles.author}>{post.author}</span>
              {' to '}
              <Link href={`/r/${subreddit}`} className={styles.subredditLink}>
                r/{subreddit}
              </Link>
            </p>
            {post.is_self && post.selftext_html && (
              <div
                className={styles.selfText}
                dangerouslySetInnerHTML={{ __html: post.selftext_html }}
              />
            )}
          </div>
        </div>

        <div className={styles.commentHeader}>
          {comments.length} comment{comments.length !== 1 ? 's' : ''}
        </div>
        <CommentThread comments={comments} />
      </main>
      <aside className={styles.sidebar}>
        <div className={styles.sideBox}>
          <Link href={`/r/${subreddit}`} className={styles.backLink}>
            ← back to r/{subreddit}
          </Link>
        </div>
      </aside>
    </div>
  );
}
