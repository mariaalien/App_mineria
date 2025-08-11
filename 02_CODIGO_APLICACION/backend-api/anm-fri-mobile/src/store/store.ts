// src/store/store.ts - Configuración Redux para ANM FRI
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import friSlice from './slices/friSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    fri: friSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;