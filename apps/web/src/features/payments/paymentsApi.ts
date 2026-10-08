// RTK Query endpoints for the coin-purchase payment flow (intent / confirm / cancel).
import { baseApi } from '../../api/baseApi';
import type { Payment } from '../../types';

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /payments/intents — create a payment intent; the idempotency key is sent as a header.
    createPaymentIntent: builder.mutation<Payment, { coinPackageId: string; idempotencyKey: string }>({
      query: ({ coinPackageId, idempotencyKey }) => ({
        url: '/payments/intents',
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: { coinPackageId },
      }),
    }),
    // GET /payments/:id — fetch a payment's current state (used by the mock gateway page).
    getPayment: builder.query<Payment, string>({
      query: (paymentId) => `/payments/${paymentId}`,
      providesTags: ['Payment'],
    }),
    // POST /payments/:id/confirm — simulated gateway confirmation that credits the wallet.
    confirmPayment: builder.mutation<Payment, string>({
      query: (paymentId) => ({ url: `/payments/${paymentId}/confirm`, method: 'POST' }),
      invalidatesTags: ['Wallet', 'Payment'],
    }),
    // POST /payments/:id/cancel — cancel a pending payment.
    cancelPayment: builder.mutation<Payment, string>({
      query: (paymentId) => ({ url: `/payments/${paymentId}/cancel`, method: 'POST' }),
      invalidatesTags: ['Payment'],
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useGetPaymentQuery,
  useConfirmPaymentMutation,
  useCancelPaymentMutation,
} = paymentsApi;
