import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '@/store/storeConfig';

/** Components must use these, never the raw `useDispatch` / `useSelector`. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
