"use client";

import { Copy, Heart, Eye, Film, ImageIcon, Check } from "lucide-react";
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
};

function TypeIcon({ type, className }: { type: PromptType; className?: string }) {
  if (type === "Vídeo") return <Film className={className} />;
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

  const handleCopy = async () => {
    const ok = await copyText(prompt.prompt);
    if (ok) {
      setCopied(true);
      toast.success("Prompt copiado com sucesso.");
      setTimeout(() => setCopied(false), 1600);
    } else {
      toast.error("Não foi possível copiar. Tente novamente.");
    }
  };

  return (
    <article className="group glass rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/40 flex flex-col">
      {/* Image */}
      <button
        type="button"
        onClick={() => onOpen(prompt)}
        className="relative block w-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/60"
        aria-label={`Ver detalhes de ${prompt.title}`}
      >
        <div className="aspect-[4/3] w-full bg-white/5">
          <img
            src={prompt.image}
            alt={prompt.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {/* Type badge */}
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
            TYPE_STYLE[prompt.type]
          )}
        >
          <TypeIcon type={prompt.type} className="h-3 w-3" />
          {prompt.type}
        </span>

        {/* Favorite */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(prompt.id);
          }}
          className={cn(
            "absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition-all",
            isFavorite
              ? "border-brand-pink/40 bg-brand-pink/20 text-brand-pink"
              : "border-white/15 bg-black/30 text-white/80 hover:text-brand-pink hover:border-brand-pink/40"
          )}
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart
            className={cn("h-4 w-4 transition-transform", isFavorite && "fill-current scale-110")}
          />
        </button>

        {/* Hover hint */}
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/90 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
          <Eye className="h-3 w-3" />
          Ver detalhes
        </span>
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold leading-snug line-clamp-1">
          {prompt.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {prompt.description}
        </p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {prompt.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 pt-1">
          <Button
            type="button"
            onClick={handleCopy}
            className="h-9 flex-1 gap-2 bg-brand-gradient text-white font-semibold hover:opacity-90 border-0"
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
            onClick={() => onOpen(prompt)}
            className="h-9 border-white/10 bg-white/5 text-foreground hover:bg-white/10"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1.5">Detalhes</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
