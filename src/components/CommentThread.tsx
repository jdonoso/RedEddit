import { RedditComment } from '@/types/reddit';
import styles from './CommentThread.module.css';

interface Props {
  comments: RedditComment[];
  depth?: number;
}

function timeAgo(utc: number): string {
  const secs = Math.floor(Date.now() / 1000) - utc;
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function CommentNode({ comment, depth = 0 }: { comment: RedditComment; depth?: number }) {
  const replies =
    comment.replies &&
    typeof comment.replies === 'object' &&
    comment.replies.data?.children
      ? comment.replies.data.children
          .filter((c) => c.kind === 't1')
          .map((c) => c.data as RedditComment)
      : [];

  return (
    <div className={`${styles.comment} ${depth > 0 ? styles.nested : ''}`}>
      <div className={styles.meta}>
        <span className={styles.author}>{comment.author}</span>
        <span className={styles.score}>{comment.score} points</span>
        <span className={styles.time}>{timeAgo(comment.created_utc)}</span>
      </div>
      <div
        className={styles.body}
        dangerouslySetInnerHTML={{ __html: comment.body_html }}
      />
      {replies.length > 0 && (
        <div className={styles.replies}>
          <CommentThread comments={replies} depth={depth + 1} />
        </div>
      )}
    </div>
  );
}

export default function CommentThread({ comments, depth = 0 }: Props) {
  return (
    <div className={styles.thread}>
      {comments.map(comment => (
        <CommentNode key={comment.id} comment={comment} depth={depth} />
      ))}
    </div>
  );
}
