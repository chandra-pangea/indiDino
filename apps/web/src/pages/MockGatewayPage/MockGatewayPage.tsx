// Mock payment gateway page: shows the order summary and a card form, then confirms the payment.
import { useParams, useNavigate } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetPaymentQuery } from '../../features/payments/paymentsApi';
import { useCheckout } from '../../features/payments/useCheckout';
import { useToast } from '../../components/Toast/ToastProvider';
import { Card } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Spinner } from '../../components/Spinner/Spinner';
import { useCardForm } from './useCardForm';
import styles from './MockGatewayPage.module.css';

// Renders the simulated hosted-checkout page for a single payment.
export function MockGatewayPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { data: payment, isLoading } = useGetPaymentQuery(paymentId ?? skipToken);
  const { confirm, cancel, isConfirming } = useCheckout();
  const { showToast } = useToast();
  const { fields, setField, errors, isValid } = useCardForm();

  if (isLoading || !payment) return <Spinner />;

  // Confirms the payment (the card data stays on this page and is never sent to the server).
  const handlePay = async () => {
    try {
      await confirm(payment.id);
      showToast('Payment successful — coins added!');
      navigate('/wallet');
    } catch {
      showToast('Payment failed', 'error');
    }
  };

  // Cancels the payment and returns to the wallet.
  const handleCancel = async () => {
    try {
      await cancel(payment.id);
    } catch {
      /* ignore — a non-pending payment simply cannot be cancelled */
    }
    navigate('/wallet');
  };

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.mockNote}>
          🔒 Mock gateway — this is a demo. A test card is prefilled and no real card data is collected or sent.
        </div>

        <div className={styles.summary}>
          <div>
            <div className={styles.summaryLabel}>You will receive</div>
            <div>{payment.coins} Gold Coins</div>
          </div>
          <div className={styles.amount}>${(payment.amountCents / 100).toFixed(0)}</div>
        </div>

        <div className={styles.form}>
          <Input
            id="cardholder"
            label="Cardholder name"
            value={fields.cardholder}
            error={errors.cardholder}
            onChange={(event) => setField('cardholder', event.target.value)}
          />
          <Input
            id="cardNumber"
            label="Card number"
            value={fields.cardNumber}
            error={errors.cardNumber}
            inputMode="numeric"
            onChange={(event) => setField('cardNumber', event.target.value)}
          />
          <div className={styles.row}>
            <Input
              id="expiry"
              label="Expiry"
              value={fields.expiry}
              error={errors.expiry}
              placeholder="MM/YY"
              onChange={(event) => setField('expiry', event.target.value)}
            />
            <Input
              id="cvc"
              label="CVC"
              value={fields.cvc}
              error={errors.cvc}
              inputMode="numeric"
              onChange={(event) => setField('cvc', event.target.value)}
            />
          </div>

          <div className={styles.actions}>
            <Button block disabled={!isValid || isConfirming} onClick={handlePay}>
              {isConfirming ? 'Processing…' : `Pay $${(payment.amountCents / 100).toFixed(0)}`}
            </Button>
            <Button block variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
