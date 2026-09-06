import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustandStorage';
import {
  setAccessToken,
  setRefreshToken,
  getAccessToken,
  getRefreshToken,
} from '@/lib/api/client';
import type { AuthPayload, Person } from '@/types/auth';

const AUTH_STORAGE_NAME = 'auth-storage';

type AuthState = {
  auth: AuthPayload | null;
  shouldClearCartAfterOrder: boolean;
  isHydrated: boolean;
  setAuth: (payload: AuthPayload) => void;
  updatePerson: (person: Partial<Person>) => void;
  updateAuth: (partial: Partial<AuthPayload>) => void;
  clearAuth: () => void;
  setShouldClearCartAfterOrder: (value: boolean) => void;
  resetShouldClearCartAfterOrder: () => void;
  rehydrate: () => void;
};

function syncTokens(auth: AuthPayload | null) {
  if (auth) {
    void setAccessToken(auth.access_token);
    void setRefreshToken(auth.refresh_token);
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: null,
      shouldClearCartAfterOrder: false,
      isHydrated: false,

      setAuth: (payload) => {
        syncTokens(payload);
        set({ auth: payload });
      },

      updatePerson: (personUpdates) =>
        set((state) => {
          if (!state.auth) return state;
          const nextAuth = {
            ...state.auth,
            person: { ...state.auth.person, ...personUpdates },
          };
          syncTokens(nextAuth);
          return { auth: nextAuth };
        }),

      updateAuth: (partial) =>
        set((state) => {
          if (!state.auth) return state;
          const nextAuth = { ...state.auth, ...partial };
          syncTokens(nextAuth);
          return { auth: nextAuth };
        }),

      clearAuth: () => {
        void setAccessToken(null);
        void setRefreshToken(null);
        set({ auth: null });
      },

      setShouldClearCartAfterOrder: (value) =>
        set({ shouldClearCartAfterOrder: value }),

      resetShouldClearCartAfterOrder: () =>
        set({ shouldClearCartAfterOrder: false }),

      rehydrate: () => set({ isHydrated: true }),
    }),
    {
      name: AUTH_STORAGE_NAME,
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      partialize: (state) => ({
        auth: state.auth,
        shouldClearCartAfterOrder: state.shouldClearCartAfterOrder,
      }),
      onRehydrateStorage: () => (state) => {
        syncTokens(state?.auth ?? null);
        state?.rehydrate();
      },
    },
  ),
);

export const isLoggedIn = () =>
  !!getAccessToken() && !!getRefreshToken() && !!useAuthStore.getState().auth;

export default useAuthStore;