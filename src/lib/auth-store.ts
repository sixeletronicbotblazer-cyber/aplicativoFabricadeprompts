"use client";

import { create } from "zustand";
import { BLOCKED_EMAILS } from "./auth-emails";

const CODE_A = "0519";
const CODE_B = "280394";
const SESSION_TTL = 60 * 60 * 1000; // 1 hora em ms

/**
 * Deterministic code generation based on email.
 * Same email → always same code. Alternates between CODE_A and CODE_B.
 */
export function generateCodeForEmail(email: string): string {
  const e = email.trim().toLowerCase();
  if (!e) return "";
  // Simple hash: sum of char codes
  let hash = 0;
  for (let i = 0; i < e.length; i++) {
    hash = ((hash << 5) - hash + e.charCodeAt(i)) | 0;
  }
  // Even hash → CODE_A, odd hash → CODE_B
  return hash % 2 === 0 ? CODE_A : CODE_B;
}

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "wrong_code" | "blocked" | "empty_email" };

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
 * Lógica simplificada:
 * - Gera código determinístico baseado no email (0519 ou 280394)
 * - Se email bloqueado → nega
 * - Se código confere com o gerado para o email → libera
 * - Qualquer outro caso → nega
 */
export const useAuthStore = create<AuthState>()((set) => {
  const stored = getStoredSession();
  const initialState = {
    isAuthenticated: !!stored,
  };

  return {
    ...initialState,
    login: (email: string, code: string): LoginResult => {
      const e = email.trim().toLowerCase();
      const c = code.trim();

      if (!e) {
        return { ok: false, reason: "empty_email" };
      }

      if (BLOCKED_EMAILS.has(e)) {
        return { ok: false, reason: "blocked" };
      }

      const expectedCode = generateCodeForEmail(e);
      if (c === expectedCode) {
        saveSession(e, c);
        set({ isAuthenticated: true });
        return { ok: true };
      }

      return { ok: false, reason: "wrong_code" };
    },
    logout: () => {
      clearSession();
      set({ isAuthenticated: false });
    },
  };
});
