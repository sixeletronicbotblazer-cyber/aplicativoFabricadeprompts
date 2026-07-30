"use client";

import { create } from "zustand";

/** Código de acesso autorizado. */
const ACCESS_CODE = "280394";

interface AuthState {
  isAuthenticated: boolean;
  login: (code: string) => boolean;
  logout: () => void;
}

/**
 * Auth store SEM persistência — o usuário precisa digitar o código
 * toda vez que abrir/fechar a aba. Nada é salvo em localStorage/sessionStorage.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  login: (code: string) => {
    if (code.trim() === ACCESS_CODE) {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false }),
}));
