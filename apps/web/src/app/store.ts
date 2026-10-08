// Configures the Redux store: the RTK Query API slice plus the small user UI slice.
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import userReducer from '../features/user/userSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    user: userReducer,
  },
  // Add the RTK Query middleware so caching, invalidation, and polling work.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
