"use client";

import {
  Copy,
  Heart,
  Check,
  X,
  Film,
  ImageIcon,
  Lightbulb,
  Eye,
  Play,
  Loader2,
  RefreshCw,
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
  const BROKEN_HOSTS = ["auroraprompts.com", "imgur.com", "files.catbox.moe"];
  const isBroken = (url: string | undefined) => !url || BROKEN_HOSTS.some((h) => url.includes(h));
  const hasImage = Boolean(prompt?.image) && !isBroken(prompt?.image);
  const hasVideo = Boolean(prompt?.videoUrl) && !isBroken(prompt?.videoUrl);
  const hasMedia = hasImage || hasVideo;
  const missingPrompt = !prompt?.prompt || prompt.prompt.trim().length < 10;

  /* ─── Reset video state when prompt changes ─── */
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

  /* ─── Type badge component ─── */
  const renderTypeBadge = (label?: string) => {
    if (!prompt) return null;
    const Icon = prompt.type === "Vídeo" || hasVideo ? Film : ImageIcon;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider backdrop-blur-md",
          TYPE_STYLE[prompt.type]
        )}
      >
        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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
        x-webkit-playsinline="true"
        onCanPlay={() => { setVideoLoading(false); setVideoError(false); }}
        onWaiting={() => setVideoLoading(true)}
        onPlaying={() => { setVideoLoading(false); setIsPlaying(true); }}
        onPause={() => setIsPlaying(false)}
        onError={() => { setVideoLoading(false); setVideoError(true); }}
        className="h-full w-full object-contain"
      />

      {/* Play overlay */}
      {!isPlaying && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
          <button
            type="button"
            onClick={handleVideoPlayPause}
            className="pointer-events-auto grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all hover:bg-white/25 hover:scale-110 active:scale-95"
            aria-label="Reproduzir vídeo"
          >
            <Play className="h-4.5 w-4.5 sm:h-5 sm:w-5 ml-0.5" />
          </button>
        </div>
      )}

      {/* Loading spinner */}
      {videoLoading && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-white/70" />
        </div>
      )}

      {/* Error state with retry */}
      {videoError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
          <Film className="h-6 w-6 text-white/30" />
          <p className="text-[11px] sm:text-xs text-white/60">Vídeo indisponível</p>
          <button
            type="button"
            onClick={handleVideoRetry}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/25"
          >
            <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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
          "max-h-[94vh] sm:max-h-[92vh]",
          hasMedia
            ? "max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-5xl"
            : "max-w-[95vw] sm:max-w-2xl"
        )}
      >
        {prompt && (
          <div
            className={cn(
              "grid max-h-[94vh] sm:max-h-[92vh]",
              hasMedia
                ? "grid-cols-1 md:grid-cols-5"
                : "grid-cols-1"
            )}
          >
            {/* LEFT COLUMN — Media */}
            {hasMedia && (
              <div className="relative md:col-span-2 flex flex-col bg-black/40 overflow-hidden">
                {hasImage && (
                  <div className="relative flex-1 min-h-0">
                    <img
                      src={prompt.image}
                      alt={prompt.title}
                      className="h-full w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3">
                      {renderTypeBadge()}
                    </div>
                  </div>
                )}

                {hasVideo && (
                  <div className={cn(
                    "relative overflow-hidden",
                    hasImage ? "h-36 sm:h-48 md:h-44 lg:h-52" : "flex-1 min-h-0 h-48 sm:h-72 md:h-auto"
                  )}>
                    {renderVideo()}
                    <div className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 z-10">
                      {renderTypeBadge("Vídeo")}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RIGHT COLUMN — Details */}
            <div
              className={cn(
                "relative flex flex-col overflow-hidden",
                hasMedia ? "md:col-span-3" : "",
                "p-4 sm:p-5 lg:p-6"
              )}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute right-3 sm:right-4 top-3 sm:top-4 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-black/30 text-white/70 backdrop-blur-md transition-colors hover:text-white hover:bg-black/50"
                aria-label="Fechar"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>

              {/* Type badge (when no media column) */}
              {!hasMedia && (
                <div className="mb-2.5 sm:mb-3">
                  {renderTypeBadge()}
                </div>
              )}

              {/* Title */}
              <DialogTitle className="text-base sm:text-lg lg:text-xl font-bold tracking-tight pr-10 sm:pr-12">
                {prompt.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detalhes do prompt {prompt.title}
              </DialogDescription>

              {/* Category + tags */}
              <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-1 sm:gap-1.5">
                <span className="inline-flex items-center rounded-md bg-white/8 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-foreground/70">
                  {prompt.category}
                </span>
                {prompt.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-white/5 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] text-muted-foreground/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* ── Explanation / tip box ── */}
              {prompt.explanation && (
                <div className="mt-3 sm:mt-4 rounded-xl border border-brand-purple/20 bg-brand-purple/[0.04] p-3 sm:p-4">
                  <p className="mb-1.5 sm:mb-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-purple">
                    <Lightbulb className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Como usar
                  </p>
                  <p className="whitespace-pre-line text-[12px] sm:text-[13px] leading-relaxed text-foreground/80">
                    {prompt.explanation}
                  </p>
                </div>
              )}

              {/* ── Prompt text block ── */}
              <div className="mt-3 sm:mt-4 flex-1 min-h-0">
                <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Prompt
                </p>
                {missingPrompt ? (
                  <div className="rounded-xl border border-brand-purple/15 bg-brand-purple/[0.03] p-3 sm:p-4 flex items-center gap-3">
                    <Eye className="h-5 w-5 shrink-0 text-brand-purple/40" />
                    <div>
                      <p className="text-[12px] sm:text-sm font-medium text-foreground/70">
                        Referência visual disponível
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground/50 mt-0.5">
                        O texto do prompt será adicionado em breve.
                      </p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[35vh] sm:max-h-[38vh] md:max-h-none scrollbar-premium">
                    <div
                      className="relative rounded-xl border border-white/10 bg-black/40 overflow-hidden"
                      data-protected
                      data-no-select
                    >
                      <pre
                        className="whitespace-pre-wrap break-words p-3.5 sm:p-5 text-[12px] sm:text-[13px] leading-[1.7] sm:leading-[1.8] text-foreground/90 font-mono selection:bg-brand-purple/30"
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
                        className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-white/10 bg-black/60 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-bold text-white/90 backdrop-blur-md transition-all hover:bg-black/80 active:scale-95"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* ── Bottom actions ── */}
              <div className="mt-4 sm:mt-5 flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleCopy}
                  disabled={missingPrompt}
                  className={cn(
                    "h-10 sm:h-11 flex-1 gap-2 text-[13px] sm:text-[15px] font-bold border-0 rounded-xl transition-all active:scale-[0.97]",
                    missingPrompt
                      ? "bg-white/5 text-muted-foreground/40 cursor-not-allowed"
                      : copied
                        ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                        : "bg-brand-gradient text-white hover:brightness-110 glow-purple"
                  )}
                >
                  {missingPrompt ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Referência visual
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
                    "h-10 sm:h-11 gap-2 border-white/10 text-[12px] sm:text-sm rounded-xl",
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
