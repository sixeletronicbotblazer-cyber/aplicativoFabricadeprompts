"use client";

import { Search, X, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { countFor, filterKey, type Filter } from "./filters";
import { useFavoritesStore } from "@/lib/favorites-store";
import { cn } from "@/lib/utils";

interface Chip {
  label: string;
  filter: Filter;
}

const CHIPS: Chip[] = [
  { label: "Todos", filter: { kind: "all" } },
  { label: "Imagem", filter: { kind: "type", value: "Imagem" } },
  { label: "Vídeo", filter: { kind: "type", value: "Vídeo" } },
  { label: "UGC", filter: { kind: "category", value: "UGC" } },
  { label: "POV", filter: { kind: "category", value: "POV" } },
  { label: "Selfie", filter: { kind: "category", value: "Selfie" } },
  { label: "Roupas", filter: { kind: "category", value: "Roupas" } },
  { label: "Produto", filter: { kind: "category", value: "Produto" } },
  { label: "TikTok Shop", filter: { kind: "category", value: "TikTok Shop" } },
  { label: "Shopee", filter: { kind: "category", value: "Shopee" } },
  { label: "Identidade AI", filter: { kind: "category", value: "Identidade AI" } },
  { label: "Favoritos", filter: { kind: "favorites" } },
  { label: "Recomendados", filter: { kind: "recommended" } },
];

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  filter: Filter;
  onFilterChange: (f: Filter) => void;
  onOpenMenu: () => void;
}

export function SearchBar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  onOpenMenu,
}: SearchBarProps) {
  const favIds = useFavoritesStore((s) => s.ids);
  const activeKey = filterKey(filter);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMenu}
          className="lg:hidden h-11 w-11 shrink-0 border border-white/10 bg-white/5"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar prompt por título, categoria ou objetivo…"
            className="h-11 pl-10 pr-10 bg-white/5 border-white/10 placeholder:text-muted-foreground/70"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chips — horizontally scrollable on small screens */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-premium -mx-1 px-1">
        {CHIPS.map((chip) => {
          const active = activeKey === filterKey(chip.filter);
          const count = countFor(chip.filter, favIds);
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => onFilterChange(chip.filter)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                active
                  ? "border-transparent bg-brand-gradient text-white shadow-sm glow-purple"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
            >
              {chip.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
                  active ? "bg-black/25 text-white" : "bg-white/10 text-muted-foreground"
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
