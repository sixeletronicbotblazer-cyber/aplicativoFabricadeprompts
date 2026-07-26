"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  email: string | null;
  code: string | null;
  isAuthenticated: boolean;
  /** Validação simples: exige e-mail com "@" e código não vazio. */
  login: (email: string, code: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      email: null,
      code: null,
      isAuthenticated: false,
      login: (email, code) => {
        const emailOk = email.trim().length > 3 && email.includes("@");
        const codeOk = code.trim().length > 0;
        if (emailOk && codeOk) {
          set({ email: email.trim(), code: code.trim(), isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ email: null, code: null, isAuthenticated: false }),
    }),
    { name: "promptvault-auth" }
  )
);
