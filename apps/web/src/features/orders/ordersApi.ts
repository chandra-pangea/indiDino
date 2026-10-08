// RTK Query endpoints for placing and reading orders.
import { baseApi } from '../../api/baseApi';
import type { Order } from '../../types';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /orders — place an order from the cart; the idempotency key is sent as a header.
    placeOrder: builder.mutation<Order, { idempotencyKey: string }>({
      query: ({ idempotencyKey }) => ({
        url: '/orders',
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
      }),
      invalidatesTags: ['Wallet', 'Cart', 'Orders'],
    }),
    // GET /orders — the active user's order history (arg is userId, used to key the cache per user).
    getOrders: builder.query<Order[], string>({
      query: () => '/orders',
      providesTags: ['Orders'],
    }),
  }),
});

export const { usePlaceOrderMutation, useGetOrdersQuery } = ordersApi;
