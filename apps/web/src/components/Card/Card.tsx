// Reusable surface container that wraps content in a padded, bordered panel.
import type { HTMLAttributes } from 'react';
import styles from './Card.module.css';

// Renders a card around its children.
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.card, className ?? ''].join(' ').trim()} {...rest} />;
}
