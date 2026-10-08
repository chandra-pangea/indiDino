// Orders page: list the active user's past orders and their line items.
import { useOrders } from '../../features/orders/useOrders';
import { Card } from '../../components/Card/Card';
import { Badge } from '../../components/Badge/Badge';
import { CoinAmount } from '../../components/CoinAmount/CoinAmount';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { Spinner } from '../../components/Spinner/Spinner';
import styles from './OrdersPage.module.css';

// Formats an ISO date string for display.
function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

// Renders the order history.
export function OrdersPage() {
  const { orders, isLoading } = useOrders();

  if (isLoading) return <Spinner />;

  if (orders.length === 0) {
    return (
      <div className="container">
        <h1 className="section-title">Your Orders</h1>
        <EmptyState icon="📦" title="No orders yet">
          Items you buy will appear here.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="section-title">Your Orders</h1>
      {orders.map((order) => (
        <Card key={order.id} className={styles.order}>
          <div className={styles.header}>
            <div>
              <Badge tone="success">{order.status}</Badge>
              <span className={styles.meta}> · {formatDate(order.createdAt)}</span>
            </div>
            <CoinAmount amount={order.totalCoins} />
          </div>
          {order.items.map((item) => (
            <div key={item.id} className={styles.line}>
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <CoinAmount amount={item.unitPriceCoins * item.quantity} />
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}
