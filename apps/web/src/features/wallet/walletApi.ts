// RTK Query endpoints for the wallet balance and ledger.
import { baseApi } from '../../api/baseApi';
import type { Wallet, WalletTransaction } from '../../types';

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /wallet — the active user's balance (arg is the userId, used only to key the cache per user).
    getWallet: builder.query<Wallet, string>({
      query: () => '/wallet',
      providesTags: ['Wallet'],
    }),
    // GET /wallet/transactions — the active user's ledger history.
    getWalletTransactions: builder.query<WalletTransaction[], string>({
      query: () => '/wallet/transactions',
      providesTags: ['Wallet'],
    }),
  }),
});

export const { useGetWalletQuery, useGetWalletTransactionsQuery } = walletApi;
