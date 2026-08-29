"use client";

import { Sparkles, X } from "lucide-react";
import { useState } from "react";

/**
 * Days that elapse before the banner auto-dismisses.
 * Set to 3 so users always see it for a few days after each visit.
 */
const FRESHNESS_DAYS = 3;

function getStoredDismissDate(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("promptvault-banner-dismissed");
  } catch {
    return null;
  }
}

function storeDismissDate() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("promptvault-banner-dismissed", new Date().toISOString());
  } catch {
    // ignore
  }
}

export function UpdateBanner() {
  const [dismissed, setDismissed] = useState(() => {
    const d = getStoredDismissDate();
    if (!d) return false;
    const diffMs = Date.now() - new Date(d).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    // Re-show after FRESHNESS_DAYS
    return diffDays < FRESHNESS_DAYS;
  });

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-purple/20 bg-gradient-to-r from-brand-purple/[0.12] via-brand-pink/[0.08] to-brand-cyan/[0.12] px-4 py-3 sm:px-5">
      {/* Animated glow dots */}
      <div aria-hidden className="pointer-events-none absolute -left-4 -top-4 h-20 w-20 rounded-full bg-brand-purple/20 blur-2xl animate-pulse" />
      <div aria-hidden className="pointer-events-none absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-brand-cyan/20 blur-2xl animate-pulse [animation-delay:1s]" />

      <div className="relative flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient">
          <Sparkles className="h-4.5 w-4.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            📦 Conteúdo atualizado recentemente!
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed truncate sm:whitespace-normal">
            Novos prompts e explicações foram adicionados ao acervo. Navegue pela seção <span className="font-medium text-brand-cyan">Identidade AI</span> para conferir.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            storeDismissDate();
          }}
          className="shrink-0 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/20 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground hover:bg-black/40"
          aria-label="Fechar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
