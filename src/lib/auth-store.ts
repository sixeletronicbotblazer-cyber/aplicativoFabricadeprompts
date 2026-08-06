"use client";

import { create } from "zustand";
import { BLOCKED_EMAILS, VALID_EMAILS } from "./auth-emails";

const OLD_CODE = "280394";
const NEW_CODE = "0519";

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "wrong_code" | "blocked" | "email_not_found" };

interface AuthState {
  isAuthenticated: boolean;
  login: (email: string, code: string) => LoginResult;
  logout: () => void;
}

/**
 * Auth store SEM persistência — o usuário precisa digitar o código
 * toda vez que abrir/fechar a aba. Nada é salvo em localStorage/sessionStorage.
 *
 * Lógica:
 * - Código novo (0519) + qualquer email → libera
 * - Código antigo (280394) + email válido → libera
 * - Código antigo (280394) + email reembolsado → bloqueia
 * - Código antigo (280394) + email não encontrado → nega
 * - Qualquer outro código → nega
 */
export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  login: (email: string, code: string): LoginResult => {
    const e = email.trim().toLowerCase();
    const c = code.trim();

    // New access code — any email is accepted
    if (c === NEW_CODE && e.length > 0) {
      set({ isAuthenticated: true });
      return { ok: true };
    }

    // Old access code — validate against email lists
    if (c === OLD_CODE) {
      if (BLOCKED_EMAILS.has(e)) {
        return { ok: false, reason: "blocked" };
      }
      if (VALID_EMAILS.has(e)) {
        set({ isAuthenticated: true });
        return { ok: true };
      }
      return { ok: false, reason: "email_not_found" };
    }

    return { ok: false, reason: "wrong_code" };
  },
  logout: () => set({ isAuthenticated: false }),
}));
