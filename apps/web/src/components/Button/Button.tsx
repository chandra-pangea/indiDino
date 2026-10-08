// Reusable button with primary / secondary / ghost variants and an optional full-width mode.
import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  block?: boolean;
}

// Renders a styled button, composing the variant and block modifier classes.
export function Button({ variant = 'primary', block = false, className, ...rest }: ButtonProps) {
  const classes = [styles.button, styles[variant], block ? styles.block : '', className ?? ''].join(' ').trim();
  return <button className={classes} {...rest} />;
}
