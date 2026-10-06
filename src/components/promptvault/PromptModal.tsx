"use client";

import {
  Copy,
  Heart,
  Check,
  X,
  Film,
  ImageIcon,
  Lightbulb,
  Play,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Prompt, PromptType } from "@/lib/prompts";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/copy";
import { toast } from "sonner";

/* ─── Type badge styles ─── */
const TYPE_STYLE: Record<PromptType, string> = {
  Imagem: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30",
  Vídeo: "bg-brand-pink/15 text-brand-pink border-brand-pink/30",
  POV: "bg-brand-purple/20 text-brand-purple border-brand-purple/40",
  Selfie: "bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/30",
  UGC: "bg-cyan-400/15 text-cyan-300 border-cyan-400/30",
  Produto: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
};

/* ─── Tool chips config ─── */
const TOOL_CHIPS = [
  { key: "padrao", label: "PADRÃO", bg: "bg-slate-700", text: "text-white", icon: null },
  { key: "aurora", label: "AURORA", bg: "bg-purple-600", text: "text-white", icon: "spark" },
  { key: "grok", label: "GROK", bg: "bg-gray-800", text: "text-white", border: "border border-gray-500" },
  { key: "gemini", label: "GEMINI", bg: "bg-blue-600", text: "text-white", icon: null },
  { key: "kling", label: "KLING", bg: "bg-orange-600", text: "text-white", icon: null },
  { key: "flow", label: "FLOW", bg: "bg-indigo-500", text: "text-white", icon: null },
] as const;

/* ─── Props ─── */
interface PromptModalProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function PromptModal({
  prompt,
  open,
  onOpenChange,
  isFavorite,
  onToggleFavorite,
}: PromptModalProps) {
  /* ─── Copy state ─── */
  const [copied, setCopied] = useState(false);

  /* ─── Video playback state ─── */
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* ─── Derived flags ─── */
  const hasImage = Boolean(prompt?.image);
  const hasVideo = Boolean(prompt?.videoUrl);
  const hasMedia = hasImage || hasVideo;
  const missingPrompt = !prompt?.prompt || prompt.prompt.trim().length < 10;

  /* ─── Reset video state when prompt changes (render-time sync, equivalent to key={id}) ─── */
  const promptKey = prompt?.id ?? "";
  const lastKeyRef = useRef(promptKey);
  if (lastKeyRef.current !== promptKey) {
    lastKeyRef.current = promptKey;
    setVideoLoading(false);
    setVideoError(false);
    setIsPlaying(false);
  }

  /* ─── Autoplay video on mount ─── */
  useEffect(() => {
    if (!open || !hasVideo || !videoRef.current) return;
    const v = videoRef.current;
    v.play().then(() => setIsPlaying(true)).catch(() => { /* user interaction required */ });
  }, [open, hasVideo]);

  /* ─── Video handlers ─── */
  const handleVideoPlayPause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoRetry = () => {
    setVideoError(false);
    setVideoLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => { setVideoLoading(false); setIsPlaying(true); }).catch(() => { setVideoLoading(false); });
    }
  };

  /* ─── Copy handlers ─── */
  const handleCopy = async () => {
    if (!prompt || missingPrompt) return;
    const ok = await copyText(prompt.prompt);
    if (ok) {
      setCopied(true);
      toast.success("Prompt copiado!");
      setTimeout(() => setCopied(false), 1600);
    } else {
      toast.error("Não foi possível copiar.");
    }
  };

  const handleChipCopy = async (toolLabel: string) => {
    if (!prompt || missingPrompt) return;
    const ok = await copyText(prompt.prompt);
    if (ok) {
      toast.success(`Copiado para ${toolLabel}!`);
    } else {
      toast.error("Não foi possível copiar.");
    }
  };

  /* ─── Type badge component ─── */
  const renderTypeBadge = (label?: string) => {
    if (!prompt) return null;
    const Icon = prompt.type === "Vídeo" || hasVideo ? Film : ImageIcon;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md",
          TYPE_STYLE[prompt.type]
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {label ?? prompt.type}
      </span>
    );
  };

  /* ─── Video element (shared) ─── */
  const renderVideo = (className?: string) => (
    <div className={cn("relative w-full", className)}>
      <video
        ref={videoRef}
        src={prompt?.videoUrl}
        controls
        controlsList="nodownload"
        playsInline
        preload="auto"
        onCanPlay={() => { setVideoLoading(false); setVideoError(false); }}
        onWaiting={() => setVideoLoading(true)}
        onPlaying={() => { setVideoLoading(false); setIsPlaying(true); }}
        onPause={() => setIsPlaying(false)}
        onError={() => { setVideoLoading(false); setVideoError(true); }}
        className="h-full w-full object-contain"
      />

      {/* Pointer-events-none overlay — play button is pointer-events-auto */}
      {!isPlaying && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
          <button
            type="button"
            onClick={handleVideoPlayPause}
            className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all hover:bg-white/25 hover:scale-110 active:scale-95"
            aria-label="Reproduzir vídeo"
          >
            <Play className="h-5 w-5 ml-0.5" />
          </button>
        </div>
      )}

      {/* Loading spinner */}
      {videoLoading && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        </div>
      )}

      {/* Error state with retry */}
      {videoError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
          <p className="text-xs text-white/60">Erro ao carregar vídeo</p>
          <button
            type="button"
            onClick={handleVideoRetry}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/25"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "p-0 gap-0 overflow-hidden border-border-card rounded-2xl bg-popover/98 backdrop-blur-2xl",
          "max-h-[92vh]",
          hasMedia
            ? "max-w-[90vw] lg:max-w-[85vw] xl:max-w-5xl"
            : "max-w-2xl"
        )}
      >
        {prompt && (
          <div
            className={cn(
              "grid max-h-[92vh]",
              hasMedia
                ? "grid-cols-1 md:grid-cols-5"
                : "grid-cols-1"
            )}
          >
            {/* ═══════════════════════════════════════════
                LEFT COLUMN — Media (2/5 on desktop)
            ═══════════════════════════════════════════ */}
            {hasMedia && (
              <div className="relative md:col-span-2 flex flex-col bg-black/40 overflow-hidden">
                {/* Reference image */}
                {hasImage && (
                  <div className="relative flex-1 min-h-0">
                    <img
                      src={prompt.image}
                      alt={prompt.title}
                      className="h-full w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    {/* Type badge on image */}
                    <div className="absolute left-3 top-3">
                      {renderTypeBadge()}
                    </div>
                  </div>
                )}

                {/* Video (below image when both exist, or main content when image-only) */}
                {hasVideo && (
                  <div className={cn(
                    "relative overflow-hidden",
                    hasImage ? "h-40 sm:h-48 md:h-44 lg:h-52" : "flex-1 min-h-0 h-56 sm:h-72 md:h-auto"
                  )}>
                    {renderVideo()}
                    {/* Type badge on video (when no image) */}
                    {!hasImage && (
                      <div className="absolute left-3 top-3 z-10">
                        {renderTypeBadge("Vídeo")}
                      </div>
                    )}
                    {/* Badge on video when both image + video */}
                    {hasImage && (
                      <div className="absolute left-3 top-3 z-10">
                        {renderTypeBadge("Vídeo")}
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile-only: no media means this column won't render */}
              </div>
            )}

            {/* ═══════════════════════════════════════════
                RIGHT COLUMN — Details (3/5 on desktop)
            ═══════════════════════════════════════════ */}
            <div
              className={cn(
                "relative flex flex-col overflow-hidden",
                hasMedia ? "md:col-span-3" : "",
                "p-5 sm:p-6"
              )}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white/70 backdrop-blur-md transition-colors hover:text-white hover:bg-black/50"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Type badge (when no media column) */}
              {!hasMedia && (
                <div className="mb-3">
                  {renderTypeBadge()}
                </div>
              )}

              {/* Title */}
              <DialogTitle className="text-lg lg:text-xl font-bold tracking-tight pr-12">
                {prompt.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detalhes do prompt {prompt.title}
              </DialogDescription>

              {/* Category + tags */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center rounded-md bg-white/8 px-2 py-0.5 text-[11px] font-semibold text-foreground/70">
                  {prompt.category}
                </span>
                {prompt.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* ── "Copiar para:" tool chips ── */}
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-brand-purple">
                  Copiar para:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TOOL_CHIPS.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => handleChipCopy(chip.label)}
                      disabled={missingPrompt}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95",
                        chip.bg,
                        chip.text,
                        chip.border ?? "",
                        missingPrompt && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      {chip.icon === "spark" && <Sparkles className="h-3 w-3" />}
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Explanation / tip box ── */}
              {prompt.explanation && (
                <div className="mt-4 rounded-xl border border-brand-purple/20 bg-brand-purple/[0.04] p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-purple">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Como usar
                  </p>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-foreground/80">
                    {prompt.explanation}
                  </p>
                </div>
              )}

              {/* ── Prompt text block ── */}
              <div className="mt-4 flex-1 min-h-0">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Prompt
                </p>
                {missingPrompt ? (
                  <div className="rounded-xl border border-white/8 bg-black/20 p-4">
                    <p className="text-sm text-muted-foreground/60 leading-relaxed">
                      Referência visual disponível — o texto do prompt será adicionado em breve.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[38vh] md:max-h-none scrollbar-premium">
                    <div
                      className="relative rounded-xl border border-white/8 bg-black/30"
                      data-protected
                      data-no-select
                    >
                      <pre
                        className="whitespace-pre-wrap break-words p-4 text-[13px] leading-[1.7] text-foreground/90 font-mono selection:bg-brand-purple/30"
                        data-allow-select
                      >
                        {prompt.prompt}
                      </pre>
                      {/* Copy button inside prompt block */}
                      <button
                        type="button"
                        onClick={handleCopy}
                        data-copy-prompt
                        data-prompt-text={prompt.prompt}
                        className="absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-[11px] font-bold text-white/90 backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* ── Bottom actions ── */}
              <div className="mt-5 flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleCopy}
                  disabled={missingPrompt}
                  className={cn(
                    "h-11 flex-1 gap-2 text-[15px] font-bold border-0 rounded-xl transition-all active:scale-[0.97]",
                    missingPrompt
                      ? "bg-white/5 text-muted-foreground/40 cursor-not-allowed"
                      : copied
                        ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                        : "bg-brand-gradient text-white hover:brightness-110 glow-purple"
                  )}
                >
                  {missingPrompt ? (
                    <>
                      <Copy className="h-4 w-4" />
                      Em breve
                    </>
                  ) : copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar prompt
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onToggleFavorite(prompt.id)}
                  className={cn(
                    "h-11 gap-2 border-white/10 text-sm rounded-xl",
                    isFavorite
                      ? "bg-brand-pink/15 text-brand-pink border-brand-pink/30 hover:bg-brand-pink/20"
                      : "bg-white/5 text-foreground hover:bg-white/10"
                  )}
                >
                  <Heart
                    className={cn("h-4 w-4", isFavorite && "fill-current")}
                  />
                  {isFavorite ? "Salvo" : "Salvar"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
