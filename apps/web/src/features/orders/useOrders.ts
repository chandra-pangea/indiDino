// Custom hook exposing order history and the place-order action.
import { skipToken } from '@reduxjs/toolkit/query';
import { useActiveUser } from '../user/useActiveUser';
import { usePlaceOrderMutation, useGetOrdersQuery } from './ordersApi';

// Returns the order list plus a placeOrder action that is safe against double submission.
export function useOrders() {
  const { activeUserId } = useActiveUser();
  const ordersQuery = useGetOrdersQuery(activeUserId ?? skipToken);
  const [placeOrderMutation, placeState] = usePlaceOrderMutation();

  // Places an order using a fresh idempotency key so retries never double-charge.
  const placeOrder = () => placeOrderMutation({ idempotencyKey: crypto.randomUUID() }).unwrap();

  return {
    orders: ordersQuery.data ?? [],
    isLoading: ordersQuery.isLoading,
    placeOrder,
    isPlacing: placeState.isLoading,
  };
}
