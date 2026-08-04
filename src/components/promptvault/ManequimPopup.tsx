"use client";

import { useState } from "react";
import { PersonStanding, X, ArrowRight, Play, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ManequimPopupProps {
  onNavigate: () => void;
}

export function ManequimPopup({ onNavigate }: ManequimPopupProps) {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem("manequim-popup-dismissed");
  });

  const handleClose = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      sessionStorage.setItem("manequim-popup-dismissed", "1");
    }
  };

  const handleGo = () => {
    handleClose(false);
    onNavigate();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-3xl border-white/10 bg-popover/95 backdrop-blur-2xl"
      >
        <DialogTitle className="sr-only">Novo: Estilo Manequim</DialogTitle>
        <DialogDescription className="sr-only">
          Nova seção de prompts no estilo manequim com 3 fases de produção.
        </DialogDescription>

        <div className="relative">
          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-brand-purple/30 via-brand-pink/20 to-brand-cyan/15 px-6 pt-6 pb-5">
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/30 text-white/80 backdrop-blur-md transition-colors hover:text-white hover:bg-black/50"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient glow-purple">
                <PersonStanding className="h-5.5 w-5.5 text-white" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                  <Sparkles className="h-3 w-3" />
                  Novo
                </span>
                <h2 className="text-xl font-semibold tracking-tight">
                  Estilo Manequim
                </h2>
              </div>
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed">
              Nova seção com 3 fases de produção de vídeo para TikTok Shop:
            </p>
          </div>

          {/* 3 Phases */}
          <div className="px-6 py-5 space-y-3">
            {[
              {
                phase: "Fase 1",
                title: "Roupa Tradicional (Hook)",
                desc: "Manequim com a roupa na esteira — ideal como abertura",
              },
              {
                phase: "Fase 2",
                title: "Roupa no Cabide",
                desc: "Segurando a peça no cabide enquanto caminha",
              },
              {
                phase: "Fase 3",
                title: "Vestindo a Roupa",
                desc: "Vestindo a peça ao vivo em movimento",
              },
            ].map((item) => (
              <div
                key={item.phase}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3"
              >
                <span className="shrink-0 grid h-8 w-8 place-items-center rounded-lg bg-brand-purple/15 text-brand-purple text-xs font-bold">
                  {item.phase.split(" ")[1]}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug">{item.title}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <Play className="h-4 w-4 shrink-0 text-muted-foreground/50 mt-0.5" />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-6 pb-6 flex gap-2">
            <button
              type="button"
              onClick={handleGo}
              className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient text-white font-semibold hover:opacity-90 transition-opacity glow-purple border-0"
            >
              Ver seção Manequim
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="h-11 px-5 rounded-xl border border-white/10 bg-white/5 text-foreground font-medium hover:bg-white/10 transition-colors"
            >
              Depois
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
