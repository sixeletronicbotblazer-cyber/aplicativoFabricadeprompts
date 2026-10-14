"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ImageIcon,
  X,
  Monitor,
  MousePointerClick,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Camera,
  Upload,
  FileText,
} from "lucide-react";

const STORAGE_KEY = "promptvault-usage-guide-v1";

function wasDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "dismissed";
  } catch {
    return false;
  }
}

function markDismissed() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, "dismissed");
  } catch {
    // ignore
  }
}

export function UsageGuidePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (wasDismissed()) return;
    // Show after a brief delay so the page loads first
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    markDismissed();
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Guia de uso dos prompts"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0c0a14]/95 shadow-2xl shadow-brand-purple/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        {/* Glow effects */}
        <div aria-hidden className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-brand-cyan/20 blur-3xl" />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/30 text-muted-foreground backdrop-blur-sm transition-all hover:text-foreground hover:bg-black/50"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                Como usar os prompts
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Leia antes de gerar seus vídeos
              </p>
            </div>
          </div>

          {/* ── SECTION 1: Imagem de Referência ── */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-500/15 border border-amber-500/25">
                <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <h3 className="text-[13px] font-bold text-amber-400 uppercase tracking-wide">
                Imagem de Referência
              </h3>
            </div>

            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.06] px-4 py-3 mb-3">
              <p className="text-[12px] sm:text-[13px] text-foreground/90 leading-relaxed font-medium">
                Para o melhor funcionamento de quase todos os prompts, você precisa subir a imagem do seu produto ou da sua modelo{" "}
                <span className="text-amber-400 font-bold">exatamente igual</span> à imagem do vídeo de referência.
              </p>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-purple/20 border border-brand-purple/30 text-[10px] font-bold text-brand-purple">1</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground/90 leading-relaxed">
                    <span className="font-semibold">Pause o vídeo</span> de referência no melhor frame (onde o produto ou modelo aparece com clareza)
                  </p>
                </div>
                <Camera className="h-4 w-4 shrink-0 text-brand-purple/60 mt-0.5" />
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-purple/20 border border-brand-purple/30 text-[10px] font-bold text-brand-purple">2</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground/90 leading-relaxed">
                    <span className="font-semibold">Tire um print</span> — no computador use <span className="text-brand-cyan font-medium">Print Screen</span> ou <span className="text-brand-cyan font-medium">Win+Shift+S</span>. No celular, segure a tela e tire captura.
                  </p>
                </div>
                <Monitor className="h-4 w-4 shrink-0 text-brand-purple/60 mt-0.5" />
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-purple/20 border border-brand-purple/30 text-[10px] font-bold text-brand-purple">3</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground/90 leading-relaxed">
                    <span className="font-semibold">Abra no computador</span> e clique com o <span className="text-brand-cyan font-medium">botão direito → Salvar imagem como...</span> para ter o arquivo pronto
                  </p>
                </div>
                <MousePointerClick className="h-4 w-4 shrink-0 text-brand-purple/60 mt-0.5" />
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-purple/20 border border-brand-purple/30 text-[10px] font-bold text-brand-purple">4</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-foreground/90 leading-relaxed">
                    <span className="font-semibold">Suba essa imagem</span> no seu gerador de vídeo (Kling, Veo, Runway etc.) junto com o prompt copiado
                  </p>
                </div>
                <Upload className="h-4 w-4 shrink-0 text-brand-purple/60 mt-0.5" />
              </div>
            </div>

            {/* Warning box */}
            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3.5 py-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <p className="text-[11px] sm:text-[12px] text-red-300/90 leading-relaxed">
                <span className="font-bold text-red-300">Atenção:</span> Se a imagem que você subir não for igual à do vídeo de referência, o resultado pode sair diferente ou dar erro. A IA precisa da imagem correta para manter a coerência.
              </p>
            </div>
          </div>

          {/* ── SECTION 2: Leia o Prompt ── */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-cyan/15 border border-brand-cyan/25">
                <BookOpen className="h-3.5 w-3.5 text-brand-cyan" />
              </div>
              <h3 className="text-[13px] font-bold text-brand-cyan uppercase tracking-wide">
                Sempre leia o prompt antes de usar
              </h3>
            </div>

            <div className="rounded-xl border border-brand-cyan/15 bg-brand-cyan/[0.06] px-4 py-3 mb-3">
              <p className="text-[12px] sm:text-[13px] text-foreground/90 leading-relaxed">
                Antes de copiar e colar, <span className="text-brand-cyan font-bold">leia o prompt completo</span>. Alguns prompts já trazem movimentos, falas ou ações específicas inclusas. Você precisa revisar e adaptar para o seu caso.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.03] p-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <p className="text-[12px] text-foreground/80 leading-relaxed">
                  Verifique se o <span className="font-semibold text-foreground">movimento</span> descrito no prompt é o que você quer no vídeo
                </p>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.03] p-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <p className="text-[12px] text-foreground/80 leading-relaxed">
                  Veja se já tem <span className="font-semibold text-foreground">fala ou áudio</span> inclusos — se sim, ajuste ou remova conforme necessário
                </p>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.03] p-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <p className="text-[12px] text-foreground/80 leading-relaxed">
                  Adapte detalhes como <span className="font-semibold text-foreground">tipo de produto, cor, modelo, cenário</span> para combinar com o seu
                </p>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.03] p-3">
                <FileText className="h-4 w-4 shrink-0 text-brand-cyan/60 mt-0.5" />
                <p className="text-[12px] text-foreground/80 leading-relaxed">
                  Só depois de revisar, <span className="font-semibold text-foreground">copie e cole</span> no seu gerador de vídeo
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:brightness-110 active:scale-[0.98]"
          >
            <CheckCircle2 className="h-4 w-4" />
            ENTENDI, VAMOS LÁ!
          </button>

          {/* Footer */}
          <div className="flex items-center justify-center mt-3">
            <p className="text-[10px] text-muted-foreground/50 text-center">
              Essa mensagem não aparecerá novamente. Você pode sempre consultar essas dicas nos prompts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
