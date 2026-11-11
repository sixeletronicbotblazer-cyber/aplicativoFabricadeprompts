"use client";

import { Search, X, Menu, HelpCircle, LayoutGrid, Star, Film, Sparkles, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { filterKey, type Filter } from "./filters";

/** Counts shown inside each quick-access chip. */
export interface QuickCounts {
  all: number;
  pov: number;
  videos: number;
  novidades: number;
  favorites: number;
}

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  filter: Filter;
  onFilterChange: (f: Filter) => void;
  onOpenMenu: () => void;
  onOpenGuide: () => void;
  counts: QuickCounts;
}

type ChipTone = "default" | "amber" | "emerald";

interface QuickChip {
  key: string;
  label: string;
  icon: React.ElementType;
  filter: Filter;
  tone: ChipTone;
  /** Favorites keeps its pink heart in both states. */
  iconClass?: string;
}

export function SearchBar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  onOpenMenu,
  onOpenGuide,
  counts,
}: SearchBarProps) {
  const activeKey = filterKey(filter);

  const chips: QuickChip[] = [
    { key: "all", label: "Todos", icon: LayoutGrid, filter: { kind: "all" }, tone: "default" },
    { key: "pov", label: "POV em destaque", icon: Star, filter: { kind: "pov" }, tone: "amber" },
    { key: "videos-with-ref", label: "Vídeos", icon: Film, filter: { kind: "videos-with-ref" }, tone: "emerald" },
    { key: "novidades", label: "Novidades", icon: Sparkles, filter: { kind: "novidades" }, tone: "default" },
    { key: "favorites", label: "Favoritos", icon: Heart, filter: { kind: "favorites" }, tone: "default", iconClass: "text-brand-pink" },
  ];

  const chipCount = (key: string): number => {
    switch (key) {
      case "all": return counts.all;
      case "pov": return counts.pov;
      case "videos-with-ref": return counts.videos;
      case "novidades": return counts.novidades;
      case "favorites": return counts.favorites;
      default: return 0;
    }
  };

  return (
    <div className="space-y-3">
      {/* ── Hero search row ── */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMenu}
          className="lg:hidden h-11 w-11 sm:h-12 sm:w-12 shrink-0 border border-border-card bg-surface-card"
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar prompt: pov, gancho, natal, perfume…"
            className="h-11 sm:h-12 pl-11 sm:pl-12 pr-11 rounded-xl bg-surface-card border-border-card placeholder:text-muted-foreground/50 text-sm sm:text-base focus-visible:border-brand-purple/50 focus-visible:ring-brand-purple/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground/70 hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenGuide}
          className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 border border-border-card bg-surface-card"
          aria-label="Como usar os prompts"
        >
          <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* ── Quick-access chips (horizontal scroll on mobile) ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-premium pb-0.5 -mx-1 px-1">
        {chips.map((chip) => {
          const Icon = chip.icon;
          const active = activeKey === chip.key;
          const count = chipCount(chip.key);
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onFilterChange(chip.filter)}
              aria-pressed={active}
              className={cn(
                "shrink-0 inline-flex h-11 items-center gap-2 rounded-xl border px-3.5 sm:px-4 text-[13px] sm:text-sm font-semibold transition-all",
                chip.tone === "amber"
                  ? active
                    ? "border-amber-400/50 bg-amber-500/20 text-amber-200"
                    : "border-amber-400/30 bg-amber-500/10 text-amber-200/90 hover:bg-amber-500/15"
                  : chip.tone === "emerald"
                    ? active
                      ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300"
                      : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300/90 hover:bg-emerald-500/15"
                    : active
                      ? "border-brand-purple/30 bg-brand-purple/20 text-brand-purple"
                      : "border-border-card bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", chip.iconClass)} />
              <span>{chip.label}</span>
              <span
                className={cn(
                  "rounded-md px-1.5 py-px text-[10px] font-bold tabular-nums",
                  active ? "bg-white/10" : "bg-white/[0.05] text-muted-foreground/70"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
