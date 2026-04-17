import { RedditPost } from '@/types/reddit';
import PostRow from './PostRow';
import { RatingSource } from '@/lib/ratings';
import styles from './PostList.module.css';

interface Props {
  posts: RedditPost[];
  loading?: boolean;
  source?: RatingSource;
}

export default function PostList({ posts, loading, source }: Props) {
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
        <PostRow key={post.id} post={post} source={source} />
      ))}
    </div>
  );
}
