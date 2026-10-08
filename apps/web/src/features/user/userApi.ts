// RTK Query endpoints for fetching the demo users.
import { baseApi } from '../../api/baseApi';
import type { User } from '../../types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /users — the list of demo users for the switcher.
    getUsers: builder.query<User[], void>({
      query: () => '/users',
    }),
  }),
});

export const { useGetUsersQuery } = userApi;
