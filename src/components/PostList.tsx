import { RedditPost } from '@/types/reddit';
import PostRow from './PostRow';
import styles from './PostList.module.css';

interface Props {
  posts: RedditPost[];
  loading?: boolean;
}

export default function PostList({ posts, loading }: Props) {
  if (loading) {
    return <div className={styles.loading}>loading posts…</div>;
  }

  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        No posts to display. Filters may be removing everything — try adjusting them in{' '}
        <a href="/settings">settings</a>.
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {posts.map(post => (
        <PostRow key={post.id} post={post} />
      ))}
    </div>
  );
}
