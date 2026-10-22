"use client";

import {
  Copy,
  Heart,
  Film,
  ImageIcon,
  Check,
  Play,
  Pause,
  Loader2,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { Prompt, PromptType } from "@/lib/prompts";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/copy";
import { toast } from "sonner";
import { hasWorkingVideo } from "@/lib/prompts";

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

/**
 * Check if a URL is from a known broken/unreachable host.
 * Old Supabase (luoyccnsbgoxdhcqyvdb) returns 402.
 * auroraprompts.com is down/unreachable.
 * i.imgur.com is blocked in this environment.
 * All broken URLs have been migrated to local /sb/ paths or new Supabase.
 */
const BROKEN_HOSTS = [
  "luoyccnsbgoxdhcqyvdb.supabase.co",
  "auroraprompts.com",
  "i.imgur.com",
  "imgur.com",
];

function isBrokenUrl(url: string | undefined): boolean {
  if (!url) return true;
  return BROKEN_HOSTS.some((h) => url.includes(h));
}

/** Extract Google Drive file ID from a proxy URL like /api/drive-video?id=FILE_ID */
function getDriveId(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url, "https://dummy");
    return u.searchParams.get("id");
  } catch {
    const m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
  }
}

/** Build a thumbnail URL for a Drive video */
function getDriveThumbUrl(videoUrl: string | undefined): string | null {
  const id = getDriveId(videoUrl);
  if (!id) return null;
  return `/api/drive-thumb?id=${id}`;
}

/** Timeout for image loading before we consider it broken (8 seconds) */
const IMG_LOAD_TIMEOUT = 8000;

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
  const [thumbError, setThumbError] = useState(false);
  /** Image load state: true = loaded ok, false = error/timeout */
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasImage = Boolean(prompt.image);
  const hasVideo = Boolean(prompt.videoUrl);
  const missingPrompt = !prompt.prompt || prompt.prompt.trim().length < 10;
  const imageIsBroken = isBrokenUrl(prompt.image);
  const videoIsBroken = isBrokenUrl(prompt.videoUrl);
  const hasWorkingImg = hasImage && !imageIsBroken;
  const hasWorkingVid = hasVideo && !videoIsBroken;

  const showVideoThumb = hasWorkingVid && (!hasImage || imageIsBroken || prompt.type === "Vídeo");
  const hasAnyMedia = hasWorkingImg || hasWorkingVid || hasImage || hasVideo;

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

  /* Image loading timeout — mark as error if image doesn't load in time */
  useEffect(() => {
    if (!isVisible || !hasWorkingImg || showVideoThumb || imgLoaded || imgError) return;
    imgTimerRef.current = setTimeout(() => {
      if (!imgLoaded) {
        setImgError(true);
      }
    }, IMG_LOAD_TIMEOUT);
    return () => {
      if (imgTimerRef.current) clearTimeout(imgTimerRef.current);
    };
  }, [isVisible, hasWorkingImg, showVideoThumb, imgLoaded, imgError]);

  /* Video loading timeout — fallback to thumbnail if video doesn't load in 12s */
  useEffect(() => {
    if (!isVisible || !showVideoThumb || videoError) return;
    const timer = setTimeout(() => {
      if (videoLoading) {
        setVideoError(true);
        setVideoLoading(false);
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [isVisible, showVideoThumb, videoError, videoLoading]);

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

  /* Video retry handler */
  const handleVideoRetry = useCallback(() => {
    setVideoError(false);
    setVideoLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  /* Image load success handler */
  const handleImgLoad = useCallback(() => {
    setImgLoaded(true);
    setImgError(false);
    if (imgTimerRef.current) clearTimeout(imgTimerRef.current);
  }, []);

  /* Image load error handler */
  const handleImgError = useCallback(() => {
    setImgError(true);
    setImgLoaded(false);
    if (imgTimerRef.current) clearTimeout(imgTimerRef.current);
  }, []);

  /* Image retry handler */
  const handleImgRetry = useCallback(() => {
    setImgError(false);
    setImgLoaded(false);
  }, []);

  /* Derive thumbnail fallback URL for Drive videos */
  const thumbUrl = videoError ? getDriveThumbUrl(prompt.videoUrl) : null;

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(prompt.id);
  };

  /* Open the modal */
  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen(prompt);
  };

  /* ─── COMPACT CARD (no preview) ─── */
  if (!hasAnyMedia) {
    return (
      <article ref={cardRef} className="group pv-card relative overflow-hidden">
        <div className="flex items-center gap-3 p-3 sm:p-4">
          <span
            className={cn(
              "inline-flex items-center justify-center shrink-0 rounded-lg border h-9 w-9 sm:h-10 sm:w-10",
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
            <h3 className="text-[12px] sm:text-[13px] font-semibold leading-tight line-clamp-1 text-text-primary">
              {prompt.title}
            </h3>
            <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-text-secondary">
              {prompt.category}
              {missingPrompt && (
                <span className="inline-flex items-center gap-0.5 text-[9px] text-brand-purple/60">
                  <Eye className="h-2.5 w-2.5" />ref
                </span>
              )}
            </span>
          </button>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Button
              type="button"
              onClick={handleOpenModal}
              size="sm"
              className={cn(
                "h-7 sm:h-8 px-2.5 sm:px-3 gap-1 text-[10px] sm:text-[11px] font-bold border-0 rounded-lg transition-all active:scale-[0.97]",
                missingPrompt
                  ? "bg-white/15 text-white/70 hover:bg-white/20"
                  : "bg-brand-turquesa text-white hover:brightness-110 shadow-sm shadow-brand-turquesa/30"
              )}
            >
              {missingPrompt ? <Eye className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
            <button
              type="button"
              onClick={handleFavorite}
              className={cn(
                "grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-lg border transition-all",
                isFavorite
                  ? "border-brand-pink/30 bg-brand-pink/10 text-brand-pink"
                  : "border-border-card bg-surface-card text-text-secondary/50 hover:text-brand-pink hover:border-brand-pink/30"
              )}
              aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", isFavorite && "fill-current")} />
            </button>
          </div>
        </div>
      </article>
    );
  }

  /* Determine what to show in the preview area */
  const showImagePreview = isVisible && hasWorkingImg && !showVideoThumb && !imgError;
  const showImageFallback = isVisible && hasWorkingImg && !showVideoThumb && imgError && !imgLoaded;
  const showImageLoading = isVisible && hasWorkingImg && !showVideoThumb && !imgLoaded && !imgError;

  /* ─── FULL CARD (with preview) ─── */
  return (
    <article ref={cardRef} className="group pv-card relative overflow-hidden flex flex-col animate-fade-in">
      {/* Preview area — clickable to open modal */}
      <div
        className="relative block w-full overflow-hidden rounded-t-[0.875rem] cursor-pointer"
        onClick={handleOpenModal}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenModal(e as any); }}
        aria-label={`Ver prompt: ${prompt.title}`}
      >
        <div className="aspect-[4/3] sm:aspect-[3/4] w-full bg-surface-secondary">
          {isVisible && showVideoThumb ? (
            /* VIDEO thumbnail with play/pause */
            <div className="relative h-full w-full bg-black/40">
              {videoLoading && !videoError && (
                <div className="absolute inset-0 grid place-items-center">
                  <Loader2 className="h-5 w-5 text-text-secondary/40 animate-spin" />
                </div>
              )}
              {videoError ? (
                hasImage && !imageIsBroken ? (
                  <img
                    src={prompt.image}
                    alt={prompt.title}
                    onError={handleImgError}
                    onLoad={handleImgLoad}
                    className="h-full w-full object-cover opacity-80"
                  />
                ) : thumbUrl && !thumbError ? (
                  <div className="relative h-full w-full">
                    <img
                      src={thumbUrl}
                      alt={prompt.title}
                      onError={() => setThumbError(true)}
                      className="h-full w-full object-cover opacity-70"
                    />
                    <button
                      type="button"
                      onClick={handleVideoRetry}
                      className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-[9px] font-semibold text-white/80 backdrop-blur-md hover:bg-black/60 transition-colors z-10"
                    >
                      <RefreshCw className="h-2.5 w-2.5" />
                      Reproduzir
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-surface-secondary">
                    <div className="flex flex-col items-center gap-1.5">
                      <Film className="h-6 w-6 text-text-secondary/30" />
                      <button
                        type="button"
                        onClick={handleVideoRetry}
                        className="mt-1 inline-flex items-center gap-1 rounded-lg bg-white/8 px-2 py-1 text-[9px] font-semibold text-text-secondary/60 hover:bg-white/12 transition-colors"
                      >
                        <RefreshCw className="h-2.5 w-2.5" />
                        Tentar novamente
                      </button>
                    </div>
                  </div>
                )
              ) : null}
              <video
                ref={videoRef}
                src={prompt.videoUrl}
                poster={getDriveThumbUrl(prompt.videoUrl) ?? undefined}
                muted
                playsInline
                loop
                preload="metadata"
                x-webkit-playsinline="true"
                onLoadedData={() => setVideoLoading(false)}
                onLoadedMetadata={() => setVideoLoading(false)}
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
                      "grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full backdrop-blur-md border transition-all duration-300",
                      isPlaying
                        ? "bg-black/30 border-white/10 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                        : "bg-white/12 border-white/15 scale-100 group-hover:scale-110"
                    )}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    ) : (
                      <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white ml-0.5" />
                    )}
                  </div>
                </button>
              )}
            </div>
          ) : showImagePreview ? (
            /* IMAGE preview with error handling */
            <div className="relative h-full w-full">
              {!imgLoaded && (
                <div className="absolute inset-0 grid place-items-center">
                  <Loader2 className="h-5 w-5 text-text-secondary/30 animate-spin" />
                </div>
              )}
              <img
                src={prompt.image}
                alt={prompt.title}
                loading="lazy"
                decoding="async"
                onError={handleImgError}
                onLoad={handleImgLoad}
                className={cn(
                  "h-full w-full object-cover transition-all duration-500",
                  imgLoaded ? "opacity-100 group-hover:scale-[1.02]" : "opacity-0"
                )}
              />
            </div>
          ) : showImageFallback ? (
            /* Image failed to load — show fallback with retry */
            <div className="h-full w-full grid place-items-center bg-surface-secondary">
              <div className="flex flex-col items-center gap-1.5">
                <ImageIcon className="h-6 w-6 text-text-secondary/30" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleImgRetry(); }}
                  className="mt-1 inline-flex items-center gap-1 rounded-lg bg-white/8 px-2 py-1 text-[9px] font-semibold text-text-secondary/60 hover:bg-white/12 transition-colors"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  Recarregar
                </button>
              </div>
            </div>
          ) : showImageLoading ? (
            /* Image is loading */
            <div className="h-full w-full skeleton-shimmer" />
          ) : isVisible && (hasImage && imageIsBroken) && !showVideoThumb ? (
            /* URL is known broken — show placeholder icon */
            <div className="h-full w-full grid place-items-center bg-surface-secondary">
              <div className="flex flex-col items-center gap-1">
                {prompt.type === "Vídeo" ? (
                  <Film className="h-8 w-8 text-text-secondary/20" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-text-secondary/20" />
                )}
                <span className="text-[9px] text-text-secondary/30">Indisponível</span>
              </div>
            </div>
          ) : (
            <div className="h-full w-full skeleton-shimmer" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Category tag */}
        <span className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 inline-flex items-center gap-1 rounded-md border px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider backdrop-blur-md bg-surface-dark/60 text-text-primary/80 border-border-card/40 pointer-events-none">
          {prompt.category}
        </span>

        {/* NOVO badge */}
        {prompt.isNew && (
          <span className="absolute right-10 sm:right-12 top-2.5 sm:top-3 inline-flex items-center rounded-full bg-brand-turquesa/20 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-brand-turquesa backdrop-blur-md z-[2] pointer-events-none">
            Novo
          </span>
        )}

        {/* Working video badge */}
        {hasWorkingVideo(prompt) && !videoIsBroken && (
          <span className="absolute right-10 sm:right-12 bottom-3 sm:bottom-4 inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-emerald-400 backdrop-blur-md z-[2] pointer-events-none">
            ✓ Vídeo
          </span>
        )}

        {/* Referência badge — for prompts without text */}
        {missingPrompt && (
          <span className="absolute right-10 sm:right-12 bottom-3 sm:bottom-4 inline-flex items-center gap-1 rounded-full bg-brand-purple/20 px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-brand-purple backdrop-blur-md z-[2] pointer-events-none">
            <Eye className="h-2.5 w-2.5" />Ref
          </span>
        )}
      </div>

      {/* Favorite button */}
      <button
        type="button"
        onClick={handleFavorite}
        className={cn(
          "absolute right-2.5 sm:right-3 top-2.5 sm:top-3 z-10 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg border backdrop-blur-md transition-all",
          isFavorite
            ? "border-brand-pink/30 bg-brand-pink/15 text-brand-pink"
            : "border-white/8 bg-black/20 text-white/60 hover:text-brand-pink hover:border-brand-pink/30"
        )}
        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", isFavorite && "fill-current")} />
      </button>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-3 sm:p-3.5 pt-2.5 sm:pt-3">
        <h3 className="text-[12px] sm:text-[13px] font-semibold leading-snug line-clamp-2 text-text-primary">
          {prompt.title}
        </h3>

        {/* Action button — opens the modal */}
        <div className="mt-auto pt-2">
          <Button
            type="button"
            onClick={handleOpenModal}
            size="sm"
            className={cn(
              "h-8 sm:h-9 w-full gap-1.5 text-[11px] sm:text-[12px] font-bold border-0 rounded-lg transition-all active:scale-[0.97]",
              missingPrompt
                ? "bg-white/15 text-white/70 hover:bg-white/20"
                : "bg-brand-turquesa text-white hover:brightness-110 shadow-sm shadow-brand-turquesa/30"
            )}
          >
            {missingPrompt ? (
              <>
                <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Ver referência
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Copiar prompt
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
