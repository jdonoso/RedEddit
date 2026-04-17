import styles from './Sidebar.module.css';

interface Props {
  title: string;
  description?: string;
  subscribers?: number;
}

export default function Sidebar({ title, description, subscribers }: Props) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.box}>
        <h2 className={styles.title}>{title}</h2>
        {subscribers !== undefined && (
          <p className={styles.subscribers}>
            {subscribers.toLocaleString()} readers
          </p>
        )}
        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </div>
      <div className={styles.box}>
        <h3 className={styles.sectionTitle}>about RedEddit</h3>
        <p className={styles.about}>
          A cleaner Reddit experience inspired by 2008–2014. No politics,
          no memes, no doomscrolling. Just links and discussion.
        </p>
        <a href="/settings" className={styles.settingsLink}>
          customize my subreddits →
        </a>
      </div>
    </aside>
  );
}
