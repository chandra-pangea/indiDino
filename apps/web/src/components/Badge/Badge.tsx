// Small pill label for categories and statuses, with optional success/danger tone.
import type { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: ReactNode;
  tone?: 'default' | 'success' | 'danger';
}

// Renders a tinted pill around its label.
export function Badge({ children, tone = 'default' }: BadgeProps) {
  const toneClass = tone === 'success' ? styles.success : tone === 'danger' ? styles.danger : '';
  return <span className={[styles.badge, toneClass].join(' ').trim()}>{children}</span>;
}
