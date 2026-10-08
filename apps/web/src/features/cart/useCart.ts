// Custom hook exposing the cart and the actions to modify it.
import { skipToken } from '@reduxjs/toolkit/query';
import { useActiveUser } from '../user/useActiveUser';
import {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from './cartApi';

// Returns the cart data plus add/update/remove/clear actions for the active user.
export function useCart() {
  const { activeUserId } = useActiveUser();
  const cartQuery = useGetCartQuery(activeUserId ?? skipToken);
  const [addItem] = useAddCartItemMutation();
  const [updateItem] = useUpdateCartItemMutation();
  const [removeItem] = useRemoveCartItemMutation();
  const [clearCart] = useClearCartMutation();

  return {
    cart: cartQuery.data,
    items: cartQuery.data?.items ?? [],
    totalItems: cartQuery.data?.totalItems ?? 0,
    totalCoins: cartQuery.data?.totalCoins ?? 0,
    isLoading: cartQuery.isLoading,
    // Adds a product (defaults to one unit).
    addItem: (productId: string, quantity = 1) => addItem({ productId, quantity }).unwrap(),
    // Sets a line item's absolute quantity (0 removes it).
    setQuantity: (productId: string, quantity: number) => updateItem({ productId, quantity }).unwrap(),
    // Removes a product from the cart.
    removeItem: (productId: string) => removeItem({ productId }).unwrap(),
    // Empties the cart.
    clearCart: () => clearCart().unwrap(),
  };
}
