"use client";

import { useState } from "react";
import { Camera, X, ArrowRight, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SelfieUGCPopupProps {
  onNavigate: () => void;
}

export function ManequimPopup({ onNavigate }: SelfieUGCPopupProps) {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem("selfie-ugc-popup-dismissed");
  });

  const handleClose = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      sessionStorage.setItem("selfie-ugc-popup-dismissed", "1");
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
        className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-3xl border-white/10 bg-popover/95 backdrop-blur-2xl"
      >
        <DialogTitle className="sr-only">Novo: Módulo Selfie UGC</DialogTitle>
        <DialogDescription className="sr-only">
          Nova seção de prompts Selfie UGC com 16 prompts de imagem e vídeo.
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

            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient glow-purple">
                <Camera className="h-5.5 w-5.5 text-white" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                  <Sparkles className="h-3 w-3" />
                  Novo
                </span>
                <h2 className="text-xl font-semibold tracking-tight">
                  Módulo Selfie UGC
                </h2>
              </div>
            </div>
          </div>

          {/* Brief description */}
          <div className="px-6 py-5">
            <p className="text-sm text-foreground/80 leading-relaxed">
              Novo módulo completo com <span className="font-semibold text-foreground">1 prompt de imagem base</span> e{" "}
              <span className="font-semibold text-foreground">15 movimentos de vídeo</span> para criar conteúdo
              selfie UGC fotorrealista no espelho — ideal para TikTok Shop.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                Imagem base (influenciadora)
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                10 movimentos base
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                5 movimentos vendedor
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="px-6 pb-6 flex gap-2">
            <button
              type="button"
              onClick={handleGo}
              className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient text-white font-semibold hover:opacity-90 transition-opacity glow-purple border-0"
            >
              Ver Selfie UGC
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
