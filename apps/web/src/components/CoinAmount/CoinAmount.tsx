// Displays a Gold Coin value with a small coin glyph; supports a larger size.
import styles from './CoinAmount.module.css';

interface CoinAmountProps {
  amount: number;
  large?: boolean;
}

// Renders the coin glyph followed by the formatted amount.
export function CoinAmount({ amount, large = false }: CoinAmountProps) {
  return (
    <span className={[styles.coin, large ? styles.large : ''].join(' ').trim()}>
      <span className={styles.glyph}>G</span>
      {amount.toLocaleString()}
    </span>
  );
}
