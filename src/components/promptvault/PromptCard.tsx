"use client";

import {
  Copy,
  Heart,
  Eye,
  Film,
  ImageIcon,
  Check,
  Play,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  Produto: "bg-amber-400/15 text-amber-300 border-amber-400/30",
};

function TypeIcon({ type, className }: { type: PromptType; className?: string }) {
  if (type === "Vídeo") return <Film className={className} />;
  if (type === "Produto") return <Eye className={className} />;
  return <ImageIcon className={className} />;
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
  const hasImage = Boolean(prompt.image);
  const hasVideo = Boolean(prompt.videoUrl);
  const showVideoThumb = hasVideo && !hasImage;

  const handleCopy = async () => {
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
    <article className="group glass relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-xl hover:shadow-black/30 flex flex-col">
      {/* Image / Video / Placeholder */}
      <button
        type="button"
        onClick={() => onOpen(prompt)}
        className="relative block w-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
        aria-label={`Ver detalhes de ${prompt.title}`}
      >
        <div className="aspect-[4/5] w-full bg-white/5">
          {hasImage ? (
            <img
              src={prompt.image}
              alt={prompt.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : showVideoThumb ? (
            <div className="relative h-full w-full bg-black/40">
              <video
                src={prompt.videoUrl}
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-white/15 backdrop-blur-md border border-white/20 transition-transform duration-300 group-hover:scale-110">
                  <Play className="h-6 w-6 text-white ml-0.5" />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-brand-purple/20 via-background to-brand-cyan/15">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full blur-2xl opacity-40"
                style={{
                  background:
                    "radial-gradient(closest-side, var(--brand-pink), transparent)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full blur-2xl opacity-30"
                style={{
                  background:
                    "radial-gradient(closest-side, var(--brand-cyan), transparent)",
                }}
              />
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10">
                  <TypeIcon type={prompt.type} className="h-5 w-5 text-white/60" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Type badge */}
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
            TYPE_STYLE[prompt.type]
          )}
        >
          <TypeIcon type={prompt.type} className="h-3 w-3" />
          {prompt.type}
        </span>
      </button>

      {/* Favorite */}
      <button
        type="button"
        onClick={() => onToggleFavorite(prompt.id)}
        className={cn(
          "absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border backdrop-blur-md transition-all",
          isFavorite
            ? "border-brand-pink/40 bg-brand-pink/20 text-brand-pink"
            : "border-white/10 bg-black/25 text-white/70 hover:text-brand-pink hover:border-brand-pink/40"
        )}
        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart
          className={cn("h-3.5 w-3.5 transition-transform", isFavorite && "fill-current scale-110")}
        />
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 pb-3">
        <h3 className="text-[15px] font-bold leading-tight line-clamp-1 text-foreground">
          {prompt.title}
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground/80 leading-relaxed line-clamp-2">
          {prompt.description}
        </p>

        <div className="mt-auto pt-3 flex items-center gap-2">
          <Button
            type="button"
            onClick={handleCopy}
            size="sm"
            className={cn(
              "h-9 flex-1 gap-1.5 text-sm font-bold border-0 transition-all active:scale-[0.97]",
              copied
                ? "bg-emerald-500/90 text-white"
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
                Copiar
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpen(prompt)}
            className="h-9 w-9 p-0 border-white/10 bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-foreground"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
