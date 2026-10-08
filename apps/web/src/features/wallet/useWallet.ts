// Custom hook exposing the active user's wallet balance and ledger.
import { skipToken } from '@reduxjs/toolkit/query';
import { useActiveUser } from '../user/useActiveUser';
import { useGetWalletQuery, useGetWalletTransactionsQuery } from './walletApi';

// Returns the wallet, coin balance, ledger entries, and loading state for the active user.
export function useWallet() {
  const { activeUserId } = useActiveUser();
  const walletQuery = useGetWalletQuery(activeUserId ?? skipToken);
  const transactionsQuery = useGetWalletTransactionsQuery(activeUserId ?? skipToken);

  return {
    wallet: walletQuery.data,
    balanceCoins: walletQuery.data?.balanceCoins ?? 0,
    transactions: transactionsQuery.data ?? [],
    isLoading: walletQuery.isLoading,
  };
}
