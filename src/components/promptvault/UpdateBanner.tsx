"use client";

import { Sparkles, X, ArrowRight, TreePine, Zap, ArrowRightLeft, Shirt, Users, Move, Heart, Eye, PawPrint, Package, Home, Star } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "promptvault-update-popup-12set";

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
  onNavigateNovidades?: () => void;
}

export function UpdateBanner({ onNavigate, onNavigateNovidades }: UpdateBannerProps) {
  const [visible, setVisible] = useState(false);
  const shouldShow = !wasShownToday();

  // Disable old popup
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("promptvault-update-popup-22ago", new Date().toISOString());
    }
  }, []);

  // Delay showing to avoid overlap with other popups
  useEffect(() => {
    if (!shouldShow) return;
    const t = setTimeout(() => setVisible(true), 2500);
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

  const handleNovidades = useCallback(() => {
    onNavigateNovidades?.();
    setVisible(false);
    markShownToday();
  }, [onNavigateNovidades]);

  if (!visible) return null;

  const newCategories = [
    { label: "Natal", icon: TreePine, color: "text-emerald-400", bg: "bg-emerald-500/15", hoverBg: "bg-emerald-500/25", border: "hover:border-emerald-500/30", category: "Natal" },
    { label: "Ganchos", icon: Zap, color: "text-brand-purple", bg: "bg-brand-purple/15", hoverBg: "bg-brand-purple/25", border: "hover:border-brand-purple/30", category: "Gancho" },
    { label: "Transições", icon: ArrowRightLeft, color: "text-brand-cyan", bg: "bg-brand-cyan/15", hoverBg: "bg-brand-cyan/25", border: "hover:border-brand-cyan/30", category: "Transição" },
    { label: "POV Moda", icon: Shirt, color: "text-pink-400", bg: "bg-pink-500/15", hoverBg: "bg-pink-500/25", border: "hover:border-pink-500/30", category: "POV Moda" },
    { label: "POV Casa", icon: Home, color: "text-amber-400", bg: "bg-amber-500/15", hoverBg: "bg-amber-500/25", border: "hover:border-amber-500/30", category: "POV Casa" },
    { label: "Casal", icon: Users, color: "text-rose-400", bg: "bg-rose-500/15", hoverBg: "bg-rose-500/25", border: "hover:border-rose-500/30", category: "Casal" },
    { label: "Masculino", icon: Star, color: "text-sky-400", bg: "bg-sky-500/15", hoverBg: "bg-sky-500/25", border: "hover:border-sky-500/30", category: "Masculino" },
    { label: "Calçados", icon: Package, color: "text-orange-400", bg: "bg-orange-500/15", hoverBg: "bg-orange-500/25", border: "hover:border-orange-500/30", category: "POV Calçados" },
    { label: "Movimento", icon: Move, color: "text-violet-400", bg: "bg-violet-500/15", hoverBg: "bg-violet-500/25", border: "hover:border-violet-500/30", category: "Movimento" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Novos prompts adicionados"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0c0a14]/95 shadow-2xl shadow-brand-purple/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        {/* Glow effects */}
        <div aria-hidden className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-brand-purple/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-brand-cyan/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-24 w-48 -translate-x-1/2 rounded-full bg-brand-pink/15 blur-3xl" />

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
                Novos prompts adicionados
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Atualização de 12/09 liberada
              </p>
            </div>
          </div>

          {/* Badge count */}
          <div className="flex items-center gap-2 mb-3 rounded-lg border border-brand-pink/20 bg-brand-pink/[0.08] px-3 py-2">
            <span className="text-lg font-black text-brand-pink">+239</span>
            <span className="text-xs text-muted-foreground">novos prompts adicionados à biblioteca</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Novos formatos, referências e comandos prontos para criar mais variações de vídeos com IA.
          </p>

          {/* New categories grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {newCategories.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => handleNavigate(cat.category)}
                className={`group flex flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] p-2.5 transition-all hover:bg-white/[0.07] ${cat.border}`}
              >
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${cat.bg} ${cat.color} group-hover:${cat.hoverBg} transition-colors`}>
                  <cat.icon className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-semibold text-foreground/80 group-hover:text-foreground">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>

          {/* Extra info */}
          <div className="flex items-center gap-2 mb-5 rounded-xl border border-brand-cyan/15 bg-brand-cyan/[0.05] px-3.5 py-2.5">
            <Eye className="h-4 w-4 shrink-0 text-brand-cyan" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Novas sessões: Natal, Ganchos, Transições, POV, Dancinha, Produto na mão, Moda, Casa, Acessórios, Pet, Trend Viral, Casal e mais.
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleNovidades}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-purple/20 transition-all hover:shadow-brand-purple/30 hover:brightness-110 active:scale-[0.98]"
          >
            VER NOVIDADES
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Secondary action */}
          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={handleClose}
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Ver depois
            </button>
            <p className="text-[10px] text-muted-foreground/50">
              Os novos prompts estão na sessão Novidades e nas categorias correspondentes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
