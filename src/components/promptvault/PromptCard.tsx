"use client";

import {
  Copy,
  Heart,
  Film,
  ImageIcon,
  Check,
  Play,
  Pause,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { Prompt, PromptType } from "@/lib/prompts";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/copy";
import { toast } from "sonner";

const TYPE_STYLE: Record<PromptType, string> = {
  Imagem: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/25",
  Vídeo: "bg-brand-pink/15 text-brand-pink border-brand-pink/25",
  POV: "bg-brand-purple/15 text-brand-purple border-brand-purple/25",
  Selfie: "bg-fuchsia-400/12 text-fuchsia-300 border-fuchsia-400/25",
  UGC: "bg-brand-turquesa/12 text-brand-turquesa border-brand-turquesa/25",
  Produto: "bg-amber-400/12 text-amber-300 border-amber-400/25",
};

function TypeIcon({ type, className }: { type: PromptType; className?: string }) {
  if (type === "Vídeo") return <Film className={className} />;
  if (type === "Produto") return <ImageIcon className={className} />;
  return <ImageIcon className={className} />;
}

/** Check if an image URL is from a known broken host. */
function isBrokenImageUrl(url: string): boolean {
  if (!url) return false;
  return url.includes("auroraprompts.com") || url.includes("imgur.com");
}

interface PromptCardProps {
  prompt: Prompt;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpen: (prompt: Prompt) => void;
}

export function PromptCard({
  prompt,
  isFavorite,
  onToggleFavorite,
  onOpen,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasImage = Boolean(prompt.image);
  const hasVideo = Boolean(prompt.videoUrl);
  const missingPrompt = !prompt.prompt || prompt.prompt.trim().length < 10;
  const imageIsBroken = isBrokenImageUrl(prompt.image || "");

  /*
   * Show video thumbnail if:
   * - Has video AND (no image OR image is from a broken host OR type is Vídeo)
   * This ensures Drive/R2 videos show even when auroraprompts images are broken
   */
  const showVideoThumb = hasVideo && (!hasImage || imageIsBroken || prompt.type === "Vídeo");
  const hasAnyMedia = hasImage || hasVideo;

  /* Intersection Observer for lazy loading */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Pause video when card leaves viewport */
  useEffect(() => {
    if (!showVideoThumb || !videoRef.current) return;
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [showVideoThumb]);

  /* Video play/pause handler */
  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setIsPlaying(true)).catch(() => setVideoError(true));
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, []);

  /* Video error handler */
  const handleVideoError = useCallback(() => {
    setVideoError(true);
    setVideoLoading(false);
  }, []);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(prompt.id);
  };

  /* COPIAR PROMPT opens the modal */
  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen(prompt);
  };

  /* ─── COMPACT CARD (no preview) ─── */
  if (!hasAnyMedia) {
    return (
      <article ref={cardRef} className="group pv-card relative overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          <span
            className={cn(
              "inline-flex items-center justify-center shrink-0 rounded-lg border h-10 w-10",
              TYPE_STYLE[prompt.type]
            )}
          >
            <TypeIcon type={prompt.type} className="h-4 w-4" />
          </span>

          <button
            type="button"
            onClick={handleOpenModal}
            className="flex-1 min-w-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-turquesa/40 rounded"
            aria-label={`Ver detalhes de ${prompt.title}`}
          >
            <h3 className="text-[13px] font-semibold leading-tight line-clamp-1 text-text-primary">
              {prompt.title}
            </h3>
            <span className="mt-0.5 inline-flex items-center text-[10px] text-text-secondary">
              {prompt.category}
            </span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              onClick={handleOpenModal}
              size="sm"
              disabled={missingPrompt}
              className={cn(
                "h-8 px-3 gap-1.5 text-[11px] font-bold border-0 rounded-lg transition-all active:scale-[0.97]",
                missingPrompt
                  ? "bg-surface-secondary text-text-secondary/30 cursor-not-allowed"
                  : "bg-turquesa-gradient text-surface-dark hover:brightness-110"
              )}
            >
              {missingPrompt ? <AlertTriangle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
            <button
              type="button"
              onClick={handleFavorite}
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-all",
                isFavorite
                  ? "border-brand-pink/30 bg-brand-pink/10 text-brand-pink"
                  : "border-border-card bg-surface-card text-text-secondary/50 hover:text-brand-pink hover:border-brand-pink/30"
              )}
              aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
            </button>
          </div>
        </div>
      </article>
    );
  }

  /* ─── FULL CARD (with preview) ─── */
  return (
    <article ref={cardRef} className="group pv-card relative overflow-hidden flex flex-col animate-fade-in">
      {/* Preview area */}
      <div className="relative block w-full overflow-hidden rounded-t-[0.875rem]">
        <div className="aspect-[3/4] w-full bg-surface-secondary">
          {isVisible && showVideoThumb ? (
            /* VIDEO thumbnail with play/pause */
            <div className="relative h-full w-full bg-black/40">
              {videoLoading && !videoError && (
                <div className="absolute inset-0 grid place-items-center">
                  <Loader2 className="h-5 w-5 text-text-secondary/40 animate-spin" />
                </div>
              )}
              {videoError ? (
                /* Video error — fall back to image if available and not broken */
                hasImage && !imageIsBroken ? (
                  <img
                    src={prompt.image}
                    alt={prompt.title}
                    className="h-full w-full object-cover opacity-80"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-surface-secondary">
                    <div className="flex flex-col items-center gap-1.5">
                      <Film className="h-6 w-6 text-text-secondary/30" />
                      <span className="text-[9px] text-text-secondary/40">Vídeo indisponível</span>
                    </div>
                  </div>
                )
              ) : null}
              <video
                ref={videoRef}
                src={prompt.videoUrl}
                muted
                playsInline
                loop
                preload="metadata"
                onLoadedData={() => setVideoLoading(false)}
                onError={handleVideoError}
                className={cn(
                  "h-full w-full object-cover transition-opacity duration-300",
                  videoLoading || videoError ? "opacity-0" : "opacity-90"
                )}
              />
              {/* Play/Pause overlay */}
              {!videoError && (
                <button
                  type="button"
                  onClick={handleVideoClick}
                  className="absolute inset-0 grid place-items-center cursor-pointer z-10"
                  aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
                >
                  <div
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-full backdrop-blur-md border transition-all duration-300",
                      isPlaying
                        ? "bg-black/30 border-white/10 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                        : "bg-white/12 border-white/15 scale-100 group-hover:scale-110"
                    )}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 text-white" />
                    ) : (
                      <Play className="h-5 w-5 text-white ml-0.5" />
                    )}
                  </div>
                </button>
              )}
            </div>
          ) : isVisible && hasImage && !imageIsBroken ? (
            /* IMAGE thumbnail (only if not from broken host) */
            <img
              src={prompt.image}
              alt={prompt.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : isVisible && (hasImage && imageIsBroken) && !showVideoThumb ? (
            /* Broken image — show fallback icon */
            <div className="h-full w-full grid place-items-center bg-surface-secondary">
              <ImageIcon className="h-8 w-8 text-text-secondary/20" />
            </div>
          ) : (
            <div className="h-full w-full skeleton-shimmer" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Category tag */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md bg-surface-dark/60 text-text-primary/80 border-border-card/40 pointer-events-none">
          {prompt.category}
        </span>

        {/* NOVO badge */}
        {prompt.isNew && (
          <span className="absolute right-12 top-3 inline-flex items-center rounded-full bg-brand-turquesa/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-turquesa backdrop-blur-md z-[2] pointer-events-none">
            Novo
          </span>
        )}

        {/* Missing prompt badge */}
        {missingPrompt && (
          <span className="absolute right-14 top-3 inline-flex items-center gap-0.5 rounded-full border border-amber-400/30 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md z-[2] pointer-events-none">
            <AlertTriangle className="h-2.5 w-2.5" />
            Sem prompt
          </span>
        )}
      </div>

      {/* Favorite button */}
      <button
        type="button"
        onClick={handleFavorite}
        className={cn(
          "absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg border backdrop-blur-md transition-all",
          isFavorite
            ? "border-brand-pink/30 bg-brand-pink/15 text-brand-pink"
            : "border-white/8 bg-black/20 text-white/60 hover:text-brand-pink hover:border-brand-pink/30"
        )}
        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
      </button>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-3.5 pt-3">
        <h3 className="text-[13px] font-semibold leading-snug line-clamp-2 text-text-primary">
          {prompt.title}
        </h3>

        {/* COPIAR PROMPT button — opens the modal */}
        <div className="mt-auto pt-2.5">
          <Button
            type="button"
            onClick={handleOpenModal}
            size="sm"
            disabled={missingPrompt}
            className={cn(
              "h-9 w-full gap-1.5 text-[12px] font-bold border-0 rounded-lg transition-all active:scale-[0.97]",
              missingPrompt
                ? "bg-surface-secondary text-text-secondary/30 cursor-not-allowed"
                : "bg-turquesa-gradient text-surface-dark hover:brightness-110"
            )}
          >
            {missingPrompt ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5" />
                Sem prompt
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copiar prompt
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
