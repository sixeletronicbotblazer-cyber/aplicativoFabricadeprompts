"use client";

import { Sparkles, X, TreePine, Zap, ArrowRightLeft, Shirt, Users, Move, Heart, Eye, PawPrint, Package, Home, Star } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "promptvault-update-banner-12set";

function wasDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

function markDismissed() {
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
  const [visible, setVisible] = useState(!wasDismissed());
  const [expanded, setExpanded] = useState(false);

  // Also disable the old popup storage key
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("promptvault-update-popup-22ago", new Date().toISOString());
      localStorage.setItem("promptvault-update-popup-12set", new Date().toISOString());
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    markDismissed();
  }, []);

  const handleNavigate = useCallback(
    (cat: string) => {
      onNavigate?.(cat);
      setVisible(false);
      markDismissed();
    },
    [onNavigate]
  );

  const handleNovidades = useCallback(() => {
    onNavigateNovidades?.();
    setVisible(false);
    markDismissed();
  }, [onNavigateNovidades]);

  if (!visible) return null;

  const newCategories = [
    { label: "Natal", icon: TreePine, color: "text-emerald-400", bg: "bg-emerald-500/15", border: "hover:border-emerald-500/30", category: "Natal" },
    { label: "Ganchos", icon: Zap, color: "text-brand-purple", bg: "bg-brand-purple/15", border: "hover:border-brand-purple/30", category: "Gancho" },
    { label: "Transições", icon: ArrowRightLeft, color: "text-brand-cyan", bg: "bg-brand-cyan/15", border: "hover:border-brand-cyan/30", category: "Transição" },
    { label: "POV Moda", icon: Shirt, color: "text-pink-400", bg: "bg-pink-500/15", border: "hover:border-pink-500/30", category: "POV Moda" },
    { label: "Casal", icon: Users, color: "text-rose-400", bg: "bg-rose-500/15", border: "hover:border-rose-500/30", category: "Casal" },
    { label: "Masculino", icon: Star, color: "text-sky-400", bg: "bg-sky-500/15", border: "hover:border-sky-500/30", category: "Masculino" },
  ];

  return (
    <div className="mx-3 sm:mx-6 lg:mx-8 mt-3 sm:mt-4 rounded-xl border border-brand-purple/20 bg-gradient-to-r from-brand-purple/[0.08] via-brand-pink/[0.05] to-brand-purple/[0.03] overflow-hidden transition-all duration-300">
      {/* ── Compact header row (always visible) ── */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-lg bg-brand-gradient shadow-sm shadow-brand-purple/20">
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] sm:text-[13px] font-bold text-brand-purple leading-tight">
            +239 novos prompts adicionados
          </p>
          <p className="text-[9px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">
            Natal, Ganchos, Transições, POV e mais — clique para ver
          </p>
        </div>
        <button
          type="button"
          onClick={handleNovidades}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-brand-gradient px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-white shadow-sm shadow-brand-purple/20 hover:brightness-110 transition-all"
        >
          Ver
        </button>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 grid h-6 w-6 place-items-center rounded-md bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 transition-colors"
          aria-label={expanded ? "Recolher" : "Expandir"}
        >
          {expanded ? "−" : "+"}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 grid h-6 w-6 place-items-center rounded-md bg-white/5 text-muted-foreground/50 hover:text-foreground hover:bg-white/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* ── Expandable content ── */}
      {expanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* New categories grid */}
          <div className="grid grid-cols-3 gap-2">
            {newCategories.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => handleNavigate(cat.category)}
                className={`group flex flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] p-2.5 transition-all hover:bg-white/[0.07] ${cat.border}`}
              >
                <span className={`grid h-7 w-7 place-items-center rounded-lg ${cat.bg} ${cat.color} transition-colors`}>
                  <cat.icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-semibold text-foreground/80 group-hover:text-foreground">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="flex items-center gap-2 rounded-lg border border-brand-cyan/15 bg-brand-cyan/[0.05] px-3 py-2">
            <Eye className="h-3.5 w-3.5 shrink-0 text-brand-cyan" />
            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
              Novas sessões: Natal, Ganchos, Transições, POV, Dancinha, Produto na mão, Moda, Casa, Acessórios, Pet, Trend Viral, Casal e mais.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
