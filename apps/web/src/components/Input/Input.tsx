// Labeled text input with an optional inline error message.
import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// Renders a label, the input, and an error line when provided.
export function Input({ label, error, id, ...rest }: InputProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input id={id} className={styles.input} {...rest} />
      {error ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}
