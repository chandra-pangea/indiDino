// Wallet page: show the balance, let the user buy coin packages, and list the ledger.
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../features/wallet/useWallet';
import { useCheckout } from '../../features/payments/useCheckout';
import { useGetCoinPackagesQuery } from '../../features/coinPackages/coinPackagesApi';
import { useToast } from '../../components/Toast/ToastProvider';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { CoinAmount } from '../../components/CoinAmount/CoinAmount';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import styles from './WalletPage.module.css';

// Formats cents as a USD price string.
function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

// Renders the balance hero, coin packages, and ledger history.
export function WalletPage() {
  const navigate = useNavigate();
  const { balanceCoins, transactions } = useWallet();
  const { data: packages = [] } = useGetCoinPackagesQuery();
  const { startPurchase, isStarting } = useCheckout();
  const { showToast } = useToast();

  // Starts a purchase and redirects to the mock payment gateway.
  const handleBuy = async (coinPackageId: string) => {
    try {
      const redirectUrl = await startPurchase(coinPackageId);
      navigate(redirectUrl);
    } catch {
      showToast('Could not start checkout', 'error');
    }
  };

  return (
    <div className="container">
      <Card className={styles.hero}>
        <div>
          <div className={styles.heroLabel}>Your balance</div>
          <CoinAmount amount={balanceCoins} large />
        </div>
      </Card>

      <h2 className="section-title">Buy Gold Coins</h2>
      <div className="grid">
        {packages.map((coinPackage) => (
          <Card key={coinPackage.id} className={styles.package}>
            <div className={styles.packageName}>{coinPackage.name}</div>
            <CoinAmount amount={coinPackage.coins} large />
            <div className={styles.price}>{formatUsd(coinPackage.priceCents)}</div>
            <Button block disabled={isStarting} onClick={() => handleBuy(coinPackage.id)}>
              Buy for {formatUsd(coinPackage.priceCents)}
            </Button>
          </Card>
        ))}
      </div>

      <div className={styles.ledger}>
        <h2 className="section-title">Transaction history</h2>
        <Card>
          {transactions.length === 0 ? (
            <EmptyState icon="📜" title="No transactions yet">
              Buy coins or place an order to see activity here.
            </EmptyState>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className={styles.row}>
                <div>
                  <Badge tone={transaction.type === 'CREDIT' ? 'success' : 'danger'}>{transaction.type}</Badge>
                  <span className={styles.rowMeta}> · {transaction.referenceType}</span>
                </div>
                <div>
                  <CoinAmount amount={transaction.amountCoins} />
                  <span className={styles.rowMeta}> · balance {transaction.balanceAfter}</span>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
