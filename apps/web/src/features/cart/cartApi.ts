// RTK Query endpoints for reading and mutating the cart; mutations invalidate the Cart cache.
import { baseApi } from '../../api/baseApi';
import type { Cart } from '../../types';

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /cart — the active user's cart (arg is userId, used to key the cache per user).
    getCart: builder.query<Cart, string>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    // POST /cart/items — add a product to the cart.
    addCartItem: builder.mutation<Cart, { productId: string; quantity?: number }>({
      query: (body) => ({ url: '/cart/items', method: 'POST', body }),
      invalidatesTags: ['Cart'],
    }),
    // PATCH /cart/items/:productId — set a line item's quantity.
    updateCartItem: builder.mutation<Cart, { productId: string; quantity: number }>({
      query: ({ productId, quantity }) => ({ url: `/cart/items/${productId}`, method: 'PATCH', body: { quantity } }),
      invalidatesTags: ['Cart'],
    }),
    // DELETE /cart/items/:productId — remove a product from the cart.
    removeCartItem: builder.mutation<Cart, { productId: string }>({
      query: ({ productId }) => ({ url: `/cart/items/${productId}`, method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    // DELETE /cart — empty the cart.
    clearCart: builder.mutation<Cart, void>({
      query: () => ({ url: '/cart', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi;
