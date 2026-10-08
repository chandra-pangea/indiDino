// Cart page: review items, adjust quantities, and place an order paid for with coins.
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../features/cart/useCart';
import { useWallet } from '../../features/wallet/useWallet';
import { useOrders } from '../../features/orders/useOrders';
import { useToast } from '../../components/Toast/ToastProvider';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { CoinAmount } from '../../components/CoinAmount/CoinAmount';
import { QuantityStepper } from '../../components/QuantityStepper/QuantityStepper';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Spinner } from '../../components/Spinner/Spinner';
import styles from './CartPage.module.css';

// Renders the cart items and the order summary.
export function CartPage() {
  const navigate = useNavigate();
  const { items, totalCoins, totalItems, isLoading, setQuantity, removeItem } = useCart();
  const { balanceCoins } = useWallet();
  const { placeOrder, isPlacing } = useOrders();
  const { showToast } = useToast();

  const canAfford = balanceCoins >= totalCoins;

  // Places the order, then navigates to order history on success.
  const handlePlaceOrder = async () => {
    try {
      await placeOrder();
      showToast('Order placed!');
      navigate('/orders');
    } catch {
      showToast('Could not place order', 'error');
    }
  };

  if (isLoading) return <Spinner />;

  if (items.length === 0) {
    return (
      <div className="container">
        <h1 className="section-title">Your Cart</h1>
        <EmptyState icon="🛒" title="Your cart is empty">
          Browse the store and add some items.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="section-title">Your Cart</h1>
      <div className={styles.layout}>
        <Card>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <img className={styles.thumb} src={item.product.imageUrl} alt={item.product.name} />
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.product.name}</div>
                <CoinAmount amount={item.product.priceCoins} />
              </div>
              <QuantityStepper value={item.quantity} onChange={(value) => setQuantity(item.productId, value)} />
              <Button variant="ghost" onClick={() => removeItem(item.productId)}>
                Remove
              </Button>
            </div>
          ))}
        </Card>

        <Card>
          <h3>Summary</h3>
          <div className={styles.summaryRow}>
            <span>Items</span>
            <span>{totalItems}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Your balance</span>
            <CoinAmount amount={balanceCoins} />
          </div>
          <div className={[styles.summaryRow, styles.total].join(' ')}>
            <span>Total</span>
            <CoinAmount amount={totalCoins} />
          </div>

          {!canAfford ? (
            <p className={styles.warning}>Not enough coins. Top up your wallet to continue.</p>
          ) : null}

          <Button block disabled={!canAfford || isPlacing} onClick={handlePlaceOrder}>
            {isPlacing ? 'Placing…' : 'Place order'}
          </Button>
          {!canAfford ? (
            <Button block variant="secondary" onClick={() => navigate('/wallet')}>
              Buy coins
            </Button>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
