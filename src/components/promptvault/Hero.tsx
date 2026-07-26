"use client";

import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  onSeeFavorites: () => void;
  favoritesCount: number;
}

export function Hero({ onSeeFavorites, favoritesCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl glass-strong glow-soft px-6 sm:px-8 py-8 sm:py-10">
      {/* glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full blur-3xl opacity-60"
        style={{
          background:
            "radial-gradient(closest-side, var(--brand-pink), transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full blur-3xl opacity-50"
        style={{
          background:
            "radial-gradient(closest-side, var(--brand-cyan), transparent)",
        }}
      />

      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-brand-pink" />
          Acervo exclusivo de prompts
        </span>

        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
          Galeria de <span className="text-gradient-brand">Prompts</span>
        </h1>

        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
          Escolha uma referência, copie o prompt e use como base para criar seus
          vídeos de TikTok Shop e Shopee com IA.
        </p>

        <div className="mt-5">
          <Button
            type="button"
            onClick={onSeeFavorites}
            variant="secondary"
            className="h-9 gap-2 rounded-full border-white/10 bg-white/5 text-foreground hover:bg-white/10"
          >
            <Heart className="h-4 w-4 text-brand-pink" />
            Ver favoritos
            {favoritesCount > 0 && (
              <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums">
                {favoritesCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
