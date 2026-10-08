// RTK Query base API: central place for server requests, cache tags, and the x-user-id header.
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../app/store';

// Resolves the API base URL from the Vite environment, falling back to localhost.
const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// A single API slice; feature files inject their own endpoints into it.
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    // Attach the active user id to every request so the backend knows whose data to use.
    prepareHeaders: (headers, { getState }) => {
      const activeUserId = (getState() as RootState).user.activeUserId;
      if (activeUserId) headers.set('x-user-id', activeUserId);
      return headers;
    },
  }),
  tagTypes: ['Wallet', 'Cart', 'Orders', 'Payment'],
  endpoints: () => ({}),
});
