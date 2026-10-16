"use client";

import { useState, useCallback } from "react";
import {
  ImageIcon,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BookOpen,
  Camera,
  Monitor,
  Upload,
  CheckCircle2,
} from "lucide-react";

/**
 * Inline collapsible banner with usage tips — replaces the old large modal popup.
 * Always visible as a compact alert bar; expands on tap to show full instructions.
 * No modal, no backdrop, no close-button-out-of-reach problems on mobile.
 */
export function UsageGuidePopup() {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded((v) => !v), []);

  return (
    <div className="mx-3 sm:mx-6 lg:mx-8 mt-3 sm:mt-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.08] via-orange-500/[0.05] to-amber-500/[0.03] overflow-hidden transition-all duration-300">
      {/* ── Compact header row (always visible) ── */}
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left"
        aria-expanded={expanded}
        aria-label="Dicas de uso dos prompts"
      >
        <div className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shadow-amber-500/20">
          <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] sm:text-[13px] font-bold text-amber-400 leading-tight">
            Como usar os prompts — leia antes de gerar
          </p>
          <p className="text-[9px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">
            Suba imagem igual à referência • Leia o prompt antes de copiar
          </p>
        </div>
        <div className="shrink-0 grid h-6 w-6 place-items-center rounded-md bg-amber-500/10 text-amber-400">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </button>

      {/* ── Expandable content ── */}
      {expanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">

          {/* Section 1: Imagem de Referência */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
              <h3 className="text-[11px] sm:text-[12px] font-bold text-amber-400 uppercase tracking-wide">
                Imagem de Referência
              </h3>
            </div>

            <p className="text-[11px] sm:text-[12px] text-foreground/85 leading-relaxed mb-2">
              Para o melhor funcionamento dos prompts, suba a imagem do seu produto ou modelo{" "}
              <span className="text-amber-400 font-bold">exatamente igual</span> à do vídeo de referência.
            </p>

            {/* Steps — compact on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mb-2">
              <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-purple/20 text-[9px] font-bold text-brand-purple">1</span>
                <p className="text-[10px] sm:text-[11px] text-foreground/80 leading-snug">
                  <span className="font-semibold">Pause o vídeo</span> no melhor frame
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-purple/20 text-[9px] font-bold text-brand-purple">2</span>
                <p className="text-[10px] sm:text-[11px] text-foreground/80 leading-snug">
                  <span className="font-semibold">Tire um print</span> — <span className="text-brand-cyan">Print Screen</span> ou captura de tela
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-purple/20 text-[9px] font-bold text-brand-purple">3</span>
                <p className="text-[10px] sm:text-[11px] text-foreground/80 leading-snug">
                  <span className="font-semibold">Botão direito</span> → Salvar imagem como…
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-purple/20 text-[9px] font-bold text-brand-purple">4</span>
                <p className="text-[10px] sm:text-[11px] text-foreground/80 leading-snug">
                  <span className="font-semibold">Suba a imagem</span> no gerador junto com o prompt
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.08] px-2.5 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400 mt-0.5" />
              <p className="text-[10px] sm:text-[11px] text-red-300/90 leading-relaxed">
                <span className="font-bold text-red-300">Atenção:</span> Se a imagem não for igual à referência, o resultado pode sair diferente ou dar erro.
              </p>
            </div>
          </div>

          {/* Section 2: Leia o Prompt */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="h-3.5 w-3.5 text-brand-cyan" />
              <h3 className="text-[11px] sm:text-[12px] font-bold text-brand-cyan uppercase tracking-wide">
                Sempre leia o prompt antes de usar
              </h3>
            </div>

            <p className="text-[11px] sm:text-[12px] text-foreground/85 leading-relaxed mb-2">
              <span className="text-brand-cyan font-bold">Leia o prompt completo</span> antes de copiar. Alguns já trazem movimentos, falas ou ações inclusas — revise e adapte.
            </p>

            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-emerald-400">
                <CheckCircle2 className="h-2.5 w-2.5" /> Verificar movimento
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-emerald-400">
                <CheckCircle2 className="h-2.5 w-2.5" /> Checar fala/áudio
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-emerald-400">
                <CheckCircle2 className="h-2.5 w-2.5" /> Adaptar produto/cenário
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-brand-cyan/20 bg-brand-cyan/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-brand-cyan">
                → Copiar e colar
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
