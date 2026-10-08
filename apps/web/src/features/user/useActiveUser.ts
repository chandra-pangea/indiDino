// Custom hook exposing the active user, the full user list, and a setter — the frontend's identity.
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setActiveUser } from './userSlice';
import { useGetUsersQuery } from './userApi';

// Returns the active user object, all users, loading state, and a function to switch users.
export function useActiveUser() {
  const dispatch = useAppDispatch();
  const activeUserId = useAppSelector((state) => state.user.activeUserId);
  const { data: users = [], isLoading } = useGetUsersQuery();

  // Default to the first user once the list loads and nothing is selected yet.
  useEffect(() => {
    if (!activeUserId && users.length > 0) {
      dispatch(setActiveUser(users[0].id));
    }
  }, [activeUserId, users, dispatch]);

  const activeUser = users.find((user) => user.id === activeUserId) ?? null;

  // Switches the active user by id.
  const selectUser = (userId: string) => dispatch(setActiveUser(userId));

  return { activeUser, activeUserId, users, isLoading, selectUser };
}
