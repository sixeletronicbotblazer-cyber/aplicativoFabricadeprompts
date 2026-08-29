"use client";

import { create } from "zustand";
import { BLOCKED_EMAILS, VALID_EMAILS } from "./auth-emails";

const OLD_CODE = "280394";
const NEW_CODE = "0519";
const SESSION_TTL = 60 * 60 * 1000; // 1 hora em ms

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "wrong_code" | "blocked" | "email_not_found" };

interface AuthState {
  isAuthenticated: boolean;
  login: (email: string, code: string) => LoginResult;
  logout: () => void;
}

function getStoredSession(): { email: string; code: string; ts: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("pv_session");
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (Date.now() - s.ts < SESSION_TTL) return s;
    localStorage.removeItem("pv_session");
    return null;
  } catch {
    return null;
  }
}

function saveSession(email: string, code: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("pv_session", JSON.stringify({ email, code, ts: Date.now() }));
}

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("pv_session");
}

/**
 * Auth store com sessão de 1h via localStorage.
 *
 * Lógica:
 * - Código novo (0519) + qualquer email → libera
 * - Código antigo (280394) + email válido → libera
 * - Código antigo (280394) + email reembolsado → bloqueia
 * - Código antigo (280394) + email não encontrado → nega
 * - Qualquer outro código → nega
 */
export const useAuthStore = create<AuthState>()((set) => {
  // Restore session on init
  const stored = getStoredSession();
  const initialState = {
    isAuthenticated: !!stored,
  };

  return {
    ...initialState,
    login: (email: string, code: string): LoginResult => {
      const e = email.trim().toLowerCase();
      const c = code.trim();

      if (c === NEW_CODE && e.length > 0) {
        saveSession(e, c);
        set({ isAuthenticated: true });
        return { ok: true };
      }

      if (c === OLD_CODE) {
        if (BLOCKED_EMAILS.has(e)) {
          return { ok: false, reason: "blocked" };
        }
        if (VALID_EMAILS.has(e)) {
          saveSession(e, c);
          set({ isAuthenticated: true });
          return { ok: true };
        }
        return { ok: false, reason: "email_not_found" };
      }

      return { ok: false, reason: "wrong_code" };
    },
    logout: () => {
      clearSession();
      set({ isAuthenticated: false });
    },
  };
});
