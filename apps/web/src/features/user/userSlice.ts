// Redux slice holding the active user id (persisted to localStorage so a refresh keeps the selection).
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const STORAGE_KEY = 'coin-vault.activeUserId';

// Reads the previously selected user id from localStorage, if any.
function loadActiveUserId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

interface UserState {
  activeUserId: string | null;
}

const initialState: UserState = {
  activeUserId: loadActiveUserId(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Sets the active user and remembers it across page reloads.
    setActiveUser(state, action: PayloadAction<string>) {
      state.activeUserId = action.payload;
      try {
        localStorage.setItem(STORAGE_KEY, action.payload);
      } catch {
        /* ignore storage failures (private mode, etc.) */
      }
    },
  },
});

export const { setActiveUser } = userSlice.actions;
export default userSlice.reducer;
