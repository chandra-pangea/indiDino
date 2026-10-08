// Custom hook driving the coin-purchase flow: start an intent, then confirm or cancel it.
import { useCreatePaymentIntentMutation, useConfirmPaymentMutation, useCancelPaymentMutation } from './paymentsApi';

// Returns actions to start a purchase (returns the redirect URL), confirm it, and cancel it.
export function useCheckout() {
  const [createIntent, createState] = useCreatePaymentIntentMutation();
  const [confirmPayment, confirmState] = useConfirmPaymentMutation();
  const [cancelPayment] = useCancelPaymentMutation();

  // Creates a payment intent with a fresh idempotency key and returns its mock-gateway redirect URL.
  const startPurchase = async (coinPackageId: string) => {
    const idempotencyKey = crypto.randomUUID();
    const payment = await createIntent({ coinPackageId, idempotencyKey }).unwrap();
    return payment.redirectUrl ?? `/checkout/mock/${payment.id}`;
  };

  // Confirms a payment (credits the wallet).
  const confirm = (paymentId: string) => confirmPayment(paymentId).unwrap();

  // Cancels a pending payment.
  const cancel = (paymentId: string) => cancelPayment(paymentId).unwrap();

  return {
    startPurchase,
    confirm,
    cancel,
    isStarting: createState.isLoading,
    isConfirming: confirmState.isLoading,
  };
}
