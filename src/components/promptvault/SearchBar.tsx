"use client";

import { Search, X, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Filter } from "./filters";

const FORMAT_TYPES = [
  { kind: "type" as const, value: "Imagem" as const, label: "Imagem" },
  { kind: "type" as const, value: "Vídeo" as const, label: "Vídeo" },
  { kind: "type" as const, value: "POV" as const, label: "POV" },
  { kind: "type" as const, value: "Selfie" as const, label: "Selfie" },
  { kind: "type" as const, value: "UGC" as const, label: "UGC" },
  { kind: "type" as const, value: "Produto" as const, label: "Produto" },
] as const;

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
  const isTypeActive = (value: string) =>
    filter.kind === "type" && filter.value === value;

  const handlePillClick = (value: (typeof FORMAT_TYPES)[number]["value"]) => {
    if (isTypeActive(value)) {
      onFilterChange({ kind: "all" });
    } else {
      onFilterChange({ kind: "type", value });
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMenu}
          className="lg:hidden h-9 w-9 sm:h-11 sm:w-11 shrink-0 border border-border-card bg-surface-card"
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar prompt..."
            className="h-9 sm:h-11 pl-9 sm:pl-10 pr-9 sm:pr-10 rounded-xl bg-surface-card border-border-card placeholder:text-muted-foreground/50 text-[13px] sm:text-sm focus-visible:border-brand-purple/50 focus-visible:ring-brand-purple/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Format filter pills — compact on mobile */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-premium pb-0.5 -mx-1 px-1">
        {FORMAT_TYPES.map((ft) => (
          <button
            key={ft.value}
            type="button"
            onClick={() => handlePillClick(ft.value)}
            className={cn(
              "shrink-0 inline-flex items-center rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold border transition-all",
              isTypeActive(ft.value)
                ? "bg-brand-purple/20 text-brand-purple border-brand-purple/30"
                : "bg-white/[0.03] text-muted-foreground/60 border-transparent hover:bg-white/[0.06] hover:text-muted-foreground"
            )}
          >
            {ft.label}
          </button>
        ))}
      </div>
    </div>
  );
}
