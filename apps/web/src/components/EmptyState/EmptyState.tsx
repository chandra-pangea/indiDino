// Placeholder shown when a list (cart, orders, ledger) is empty.
import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  children?: ReactNode;
}

// Renders an icon, a title, and optional supporting content centered on the page.
export function EmptyState({ icon = '✨', title, children }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.title}>{title}</div>
      {children}
    </div>
  );
}
