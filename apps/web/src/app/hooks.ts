// Typed versions of the Redux hooks so components get full type-safety.
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Typed dispatch hook.
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Typed selector hook.
export const useAppSelector = useSelector.withTypes<RootState>();
