"use client";

import { Search, X, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  filter: { kind: string; value?: string };
  onFilterChange: (f: any) => void;
  onOpenMenu: () => void;
}

export function SearchBar({
  query,
  onQueryChange,
  onOpenMenu,
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMenu}
        className="lg:hidden h-10 w-10 shrink-0 border border-white/10 bg-white/5"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar prompt por título, categoria ou objetivo…"
          className="h-10 pl-10 pr-10 bg-white/5 border-white/8 placeholder:text-muted-foreground/50 text-sm"
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
  );
}
