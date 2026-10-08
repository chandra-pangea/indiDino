// RTK Query endpoint for the purchasable coin packages.
import { baseApi } from '../../api/baseApi';
import type { CoinPackage } from '../../types';

export const coinPackagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /coin-packages — list active coin packages.
    getCoinPackages: builder.query<CoinPackage[], void>({
      query: () => '/coin-packages',
    }),
  }),
});

export const { useGetCoinPackagesQuery } = coinPackagesApi;
