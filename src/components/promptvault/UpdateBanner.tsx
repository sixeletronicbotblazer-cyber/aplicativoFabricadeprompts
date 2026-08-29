"use client";

import { Sparkles, X, ArrowRight, Zap, PawPrint, Baby, Target } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "promptvault-update-popup-22ago";

function wasShownToday(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const date = new Date(raw);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

function markShownToday() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  } catch {
    // ignore
  }
}

interface UpdateBannerProps {
  onNavigate?: (category: string) => void;
}

export function UpdateBanner({ onNavigate }: UpdateBannerProps) {
  const [visible, setVisible] = useState(false);
  const shouldShow = !wasShownToday();

  // Delay showing to avoid overlap with other popups (Selfie UGC, etc.)
  useEffect(() => {
    if (!shouldShow) return;
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, [shouldShow]);

  const handleClose = useCallback(() => {
    setVisible(false);
    markShownToday();
  }, []);

  const handleNavigate = useCallback(
    (cat: string) => {
      onNavigate?.(cat);
      setVisible(false);
      markShownToday();
    },
    [onNavigate]
  );

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Novos prompts disponíveis"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0c0a14]/95 shadow-2xl shadow-brand-purple/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        {/* Glow effects */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-brand-purple/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-brand-cyan/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-24 w-48 -translate-x-1/2 rounded-full bg-brand-pink/15 blur-3xl"
        />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/30 text-muted-foreground backdrop-blur-sm transition-all hover:text-foreground hover:bg-black/50"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient shadow-lg shadow-brand-purple/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                Novos Prompts Disponíveis!
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Atualização · 22 de Agosto
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            O acervo cresceu! Foram adicionados{" "}
            <span className="font-semibold text-foreground">95 novos prompts</span>{" "}
            divididos em 3 novas categorias com foco em produto, nichos específicos e
            movimentos avançados.
          </p>

          {/* New categories grid */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            <button
              type="button"
              onClick={() => handleNavigate("POV Avançado")}
              className="group flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-all hover:bg-white/[0.07] hover:border-brand-purple/30"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-purple/15 text-brand-purple group-hover:bg-brand-purple/25 transition-colors">
                <Target className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-semibold text-foreground/80 group-hover:text-foreground">
                POV Avançado
              </span>
              <span className="text-[10px] text-brand-purple font-bold">62 prompts</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("PET")}
              className="group flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-all hover:bg-white/[0.07] hover:border-emerald-500/30"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 transition-colors">
                <PawPrint className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-semibold text-foreground/80 group-hover:text-foreground">
                PET
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">10 prompts</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate("Infantil")}
              className="group flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-all hover:bg-white/[0.07] hover:border-amber-500/30"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25 transition-colors">
                <Baby className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-semibold text-foreground/80 group-hover:text-foreground">
                Infantil
              </span>
              <span className="text-[10px] text-amber-400 font-bold">12 prompts</span>
            </button>
          </div>

          {/* Also new section */}
          <div className="flex items-center gap-2 mb-5 rounded-xl border border-brand-cyan/15 bg-brand-cyan/[0.05] px-3.5 py-2.5">
            <Zap className="h-4 w-4 shrink-0 text-brand-cyan" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mais <span className="font-semibold text-foreground">11 novos</span> prompts
              de UGC, Vídeo e Selfie foram adicionados às categorias existentes.
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => handleNavigate("POV Avançado")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-purple/20 transition-all hover:shadow-brand-purple/30 hover:brightness-110 active:scale-[0.98]"
          >
            Explorar novos prompts
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-3 text-center text-[10px] text-muted-foreground/50">
            Este aviso aparece uma vez por dia
          </p>
        </div>
      </div>
    </div>
  );
}
