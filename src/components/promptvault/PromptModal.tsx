"use client";

import { Copy, Heart, Check, X, Film, ImageIcon, Lightbulb } from "lucide-react";
import { useState } from "react";
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

const TYPE_STYLE: Record<PromptType, string> = {
  Imagem: "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30",
  Vídeo: "bg-brand-pink/15 text-brand-pink border-brand-pink/30",
  POV: "bg-brand-purple/20 text-brand-purple border-brand-purple/40",
  Selfie: "bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/30",
  UGC: "bg-cyan-400/15 text-cyan-300 border-cyan-400/30",
};

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
  const [copied, setCopied] = useState(false);
  const hasImage = Boolean(prompt?.image);
  const hasVideo = Boolean(prompt?.videoUrl);
  const hasMedia = hasImage || hasVideo;

  const handleCopy = async () => {
    if (!prompt) return;
    const ok = await copyText(prompt.prompt);
    if (ok) {
      setCopied(true);
      toast.success("Prompt copiado!");
      setTimeout(() => setCopied(false), 1600);
    } else {
      toast.error("Não foi possível copiar.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "p-0 gap-0 overflow-hidden rounded-3xl border-white/10 bg-popover/95 backdrop-blur-2xl",
          hasMedia ? "max-w-4xl" : "max-w-2xl"
        )}
      >
        {prompt && (
          <div className={cn("grid max-h-[92vh]", hasMedia ? "md:grid-cols-5" : "grid-cols-1")}>
            {/* Image side */}
            {hasImage && (
              <div className="relative md:col-span-2 md:h-auto h-56 sm:h-72 md:max-h-[92vh] bg-white/5">
                <img
                  src={prompt.image}
                  alt={prompt.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r" />
                <span
                  className={cn(
                    "absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md",
                    TYPE_STYLE[prompt.type]
                  )}
                >
                  {prompt.type === "Vídeo" ? (
                    <Film className="h-3.5 w-3.5" />
                  ) : (
                    <ImageIcon className="h-3.5 w-3.5" />
                  )}
                  {prompt.type}
                </span>
              </div>
            )}

            {/* Video side (when no image but has videoUrl) */}
            {hasVideo && !hasImage && (
              <div className="relative md:col-span-2 md:h-auto h-48 sm:h-64 md:max-h-[92vh] bg-black/60">
                <video
                  src={prompt.videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-contain"
                />
                <span
                  className={cn(
                    "absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md",
                    TYPE_STYLE[prompt.type]
                  )}
                >
                  <Film className="h-3.5 w-3.5" />
                  {prompt.type}
                </span>
              </div>
            )}

            {hasImage && hasVideo && (
              <div className="relative md:col-span-5 h-48 sm:h-56 bg-black/60">
                <video
                  src={prompt.videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-contain"
                />
                <span
                  className={cn(
                    "absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md",
                    TYPE_STYLE[prompt.type]
                  )}
                >
                  <Film className="h-3.5 w-3.5" />
                  Vídeo
                </span>
              </div>
            )}

            {/* Details side */}
            <div className={cn("relative flex flex-col p-5 sm:p-7 overflow-hidden", hasMedia ? "md:col-span-3" : "")}>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/30 text-white/70 backdrop-blur-md transition-colors hover:text-white hover:bg-black/50"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>

              {!hasMedia && (
                <span
                  className={cn(
                    "mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md",
                    TYPE_STYLE[prompt.type]
                  )}
                >
                  {prompt.type === "Vídeo" ? (
                    <Film className="h-3.5 w-3.5" />
                  ) : (
                    <ImageIcon className="h-3.5 w-3.5" />
                  )}
                  {prompt.type}
                </span>
              )}

              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight pr-10">
                {prompt.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detalhes do prompt {prompt.title}
              </DialogDescription>

              <p className="mt-2 text-sm text-muted-foreground/80 leading-relaxed">
                {prompt.description}
              </p>

              {prompt.explanation && (
                <div className="mt-4 rounded-xl border border-brand-purple/20 bg-brand-purple/[0.05] p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-purple">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Como usar
                  </p>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed text-foreground/80">
                    {prompt.explanation}
                  </p>
                </div>
              )}

              {/* Prompt text - the main copy target */}
              <div className="mt-5 flex-1 min-h-0">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Prompt
                </p>
                <ScrollArea className="max-h-[38vh] md:max-h-none scrollbar-premium">
                  <div className="relative rounded-xl border border-white/8 bg-black/30">
                    <pre className="whitespace-pre-wrap break-words p-4 text-[13px] leading-[1.7] text-foreground/90 font-mono selection:bg-brand-purple/30">
                      {prompt.prompt}
                    </pre>
                    <button
                      type="button"
                      onClick={handleCopy}
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
              </div>

              {/* Bottom actions */}
              <div className="mt-5 flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    "h-11 flex-1 gap-2 text-[15px] font-bold border-0 transition-all active:scale-[0.97]",
                    copied
                      ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                      : "bg-brand-gradient text-white hover:brightness-110"
                  )}
                >
                  {copied ? (
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
                    "h-11 gap-2 border-white/10 text-sm",
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
