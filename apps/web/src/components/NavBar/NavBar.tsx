// Persistent top navigation: brand, page links with a cart badge, live balance, and the user switcher.
import { NavLink } from 'react-router-dom';
import { useCart } from '../../features/cart/useCart';
import { useWallet } from '../../features/wallet/useWallet';
import { CoinAmount } from '../CoinAmount/CoinAmount';
import { UserSwitcher } from '../UserSwitcher/UserSwitcher';
import styles from './NavBar.module.css';

// Builds the className for a nav link, marking the active route.
function linkClass({ isActive }: { isActive: boolean }) {
  return [styles.link, isActive ? styles.active : ''].join(' ').trim();
}

// Renders the top navigation bar.
export function NavBar() {
  const { totalItems } = useCart();
  const { balanceCoins } = useWallet();

  return (
    <nav className={styles.nav}>
      <NavLink to="/" className={styles.brand}>
        <span>🏦</span> Coin Vault
      </NavLink>

      <div className={styles.links}>
        <NavLink to="/" className={linkClass} end>
          Store
        </NavLink>
        <NavLink to="/cart" className={linkClass}>
          Cart{totalItems > 0 ? <span className={styles.count}>{totalItems}</span> : null}
        </NavLink>
        <NavLink to="/wallet" className={linkClass}>
          Wallet
        </NavLink>
        <NavLink to="/orders" className={linkClass}>
          Orders
        </NavLink>
      </div>

      <div className={styles.right}>
        <div className={styles.balance}>
          <CoinAmount amount={balanceCoins} />
        </div>
        <UserSwitcher />
      </div>
    </nav>
  );
}
