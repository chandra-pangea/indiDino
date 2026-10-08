// Dropdown that selects which demo user the app acts as (stands in for authentication).
import { useActiveUser } from '../../features/user/useActiveUser';
import styles from './UserSwitcher.module.css';

// Renders a labeled select bound to the active user.
export function UserSwitcher() {
  const { users, activeUserId, selectUser } = useActiveUser();

  return (
    <div className={styles.switcher}>
      <span>👤</span>
      <select
        className={styles.select}
        value={activeUserId ?? ''}
        onChange={(event) => selectUser(event.target.value)}
        aria-label="Active user"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
