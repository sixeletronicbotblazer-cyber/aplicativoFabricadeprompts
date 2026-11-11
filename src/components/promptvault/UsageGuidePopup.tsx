"use client";

import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UsageGuidePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Controlled dialog with usage instructions.
 * Opened from the info bar ("Como usar") and from the "?" button next
 * to the search field. Replaces the old always-visible inline banner.
 */
export function UsageGuidePopup({ open, onOpenChange }: UsageGuidePopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden border-border-card bg-surface-card p-0 sm:max-w-lg">
        {/* ── Header ── */}
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border-subtle px-5 pb-4 pt-5 sm:px-6">
          <DialogTitle className="flex items-center gap-2.5 pr-8 text-left text-base sm:text-lg">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-500/25">
              <HelpCircle className="h-4 w-4 text-white" />
            </span>
            Como usar os prompts
          </DialogTitle>
          <DialogDescription className="text-left text-[13px]">
            Dois minutos que salvam o seu resultado — leia antes de gerar.
          </DialogDescription>
        </DialogHeader>

        {/* ── Scrollable content ── */}
        <div className="max-h-[70vh] min-h-0 flex-auto space-y-5 overflow-y-auto px-5 py-5 scrollbar-premium sm:px-6">
          {/* Section 1: Imagem de Referência */}
          <section>
            <div className="mb-2.5 flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-amber-400">
                Imagem de Referência
              </h3>
            </div>

            <p className="mb-3 text-[13px] leading-relaxed text-foreground/85">
              Para o melhor funcionamento dos prompts, suba a imagem do seu produto ou modelo{" "}
              <span className="font-bold text-amber-400">exatamente igual</span> à do vídeo de referência.
            </p>

            {/* Steps */}
            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-purple/20 text-[10px] font-bold text-brand-purple">1</span>
                <p className="text-xs leading-snug text-foreground/80">
                  <span className="font-semibold">Pause o vídeo</span> no melhor frame
                </p>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-purple/20 text-[10px] font-bold text-brand-purple">2</span>
                <p className="text-xs leading-snug text-foreground/80">
                  <span className="font-semibold">Tire um print</span> — <span className="text-brand-cyan">Print Screen</span> ou captura de tela
                </p>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-purple/20 text-[10px] font-bold text-brand-purple">3</span>
                <p className="text-xs leading-snug text-foreground/80">
                  <span className="font-semibold">Botão direito</span> → Salvar imagem como…
                </p>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-purple/20 text-[10px] font-bold text-brand-purple">4</span>
                <p className="text-xs leading-snug text-foreground/80">
                  <span className="font-semibold">Suba a imagem</span> no gerador junto com o prompt
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <p className="text-xs leading-relaxed text-red-300/90">
                <span className="font-bold text-red-300">Atenção:</span> Se a imagem não for igual à referência, o resultado pode sair diferente ou dar erro.
              </p>
            </div>
          </section>

          {/* Section 2: Leia o Prompt */}
          <section>
            <div className="mb-2.5 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-brand-cyan" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-brand-cyan">
                Sempre leia o prompt antes de usar
              </h3>
            </div>

            <p className="mb-3 text-[13px] leading-relaxed text-foreground/85">
              <span className="font-bold text-brand-cyan">Leia o prompt completo</span> antes de copiar. Alguns já trazem movimentos, falas ou ações inclusas — revise e adapte.
            </p>

            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Verificar movimento
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Checar fala/áudio
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Adaptar produto/cenário
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-cyan/20 bg-brand-cyan/10 px-2.5 py-1 text-[11px] font-medium text-brand-cyan">
                → Copiar e colar
              </span>
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="shrink-0 border-t border-border-subtle px-5 py-4 sm:px-6">
          <DialogClose asChild>
            <Button
              type="button"
              className="h-11 w-full gap-2 rounded-xl bg-brand-gradient text-[13px] font-bold text-white shadow-sm shadow-brand-purple/25 hover:brightness-110 sm:w-auto sm:px-6"
            >
              Entendi, fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
