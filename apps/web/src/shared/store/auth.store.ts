"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}

interface AuthActions {
  setAuthenticated: (username: string) => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  isAuthenticated: false,
  username: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setAuthenticated: (username) => set({ isAuthenticated: true, username }),
      clearAuth: () => set(initialState),
    }),
    {
      name: "auth",
      // Only persist display-safe fields — tokens stay in httpOnly cookies
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        username: state.username,
      }),
    },
  ),
);
