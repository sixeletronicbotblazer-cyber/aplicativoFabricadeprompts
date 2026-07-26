"use client";

import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center animate-fade-in">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-5 text-lg font-semibold">Nenhum prompt encontrado</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
        Tente buscar por outra palavra ou selecionar outra categoria.
      </p>
      <Button
        type="button"
        onClick={onReset}
        className="mt-6 h-10 gap-2 bg-brand-gradient text-white font-semibold hover:opacity-90 border-0"
      >
        Ver todos os prompts
      </Button>
    </div>
  );
}
