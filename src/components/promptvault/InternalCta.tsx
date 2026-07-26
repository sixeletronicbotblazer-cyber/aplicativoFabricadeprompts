"use client";

import { Wand2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InternalCtaProps {
  onSeeRecommended: () => void;
}

export function InternalCta({ onSeeRecommended }: InternalCtaProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl glass-strong px-6 sm:px-8 py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-10 h-56 w-56 rounded-full blur-3xl opacity-60"
        style={{
          background:
            "radial-gradient(closest-side, var(--brand-purple), transparent)",
        }}
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient glow-purple">
              <Wand2 className="h-4 w-4 text-white" />
            </span>
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
              Quer usar melhor os prompts?
            </h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Comece pelos prompts de Selfie, depois teste POV e finalize com
            movimentos de vídeo para criar variações.
          </p>
        </div>
        <Button
          type="button"
          onClick={onSeeRecommended}
          className="h-11 shrink-0 gap-2 bg-brand-gradient text-white font-semibold hover:opacity-90 border-0 glow-purple"
        >
          Ver prompts recomendados
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
