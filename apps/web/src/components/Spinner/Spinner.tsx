// Centered loading spinner shown while data is fetching.
import styles from './Spinner.module.css';

// Renders the spinner inside a padded wrapper.
export function Spinner() {
  return (
    <div className={styles.wrap}>
      <div className={styles.spinner} />
    </div>
  );
}
