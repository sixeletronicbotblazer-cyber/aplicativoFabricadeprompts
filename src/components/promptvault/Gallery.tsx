"use client";

import { useMemo, useState } from "react";
import { Sparkles, Heart, ChevronDown, Film, ArrowRight, Zap, LayoutGrid, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROMPTS, type Prompt } from "@/lib/prompts";
import { useFavoritesStore } from "@/lib/favorites-store";
import { toast } from "sonner";
import { applyFilter, filterLabel, type Filter, ALL_FILTER } from "./filters";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { SearchBar } from "./SearchBar";
import { PromptCard } from "./PromptCard";
import { PromptModal } from "./PromptModal";
import { EmptyState } from "./EmptyState";
import { UpdateBanner } from "./UpdateBanner";
import { ManequimPopup } from "./ManequimPopup";

const PAGE_SIZE = 12;

export function Gallery() {
  const [filter, setFilterState] = useState<Filter>(ALL_FILTER);
  const [query, setQueryState] = useState("");
  const [page, setPage] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const favIds = useFavoritesStore((s) => s.ids);
  const toggleFav = useFavoritesStore((s) => s.toggle);

  const setFilter = (f: Filter) => { setFilterState(f); setPage(0); };
  const setQuery = (q: string) => { setQueryState(q); setPage(0); };

  const filtered = useMemo(() => {
    const base = applyFilter(PROMPTS, filter, favIds);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((p) => (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    ));
  }, [filter, query, favIds]);

  const visibleCount = PAGE_SIZE * (page + 1);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const BROKEN_HOSTS = ["auroraprompts.com", "imgur.com", "files.catbox.moe"];
  const isBroken = (url: string | undefined) => !url || BROKEN_HOSTS.some((h) => url.includes(h));
  const hasPreview = (p: Prompt) => !isBroken(p.image) || !isBroken(p.videoUrl);
  const previewCards = visible.filter(hasPreview);
  const noPreviewCards = visible.filter((p) => !hasPreview(p));
  const hasPreviewCards = previewCards.length > 0;
  const hasNoPreviewCards = noPreviewCards.length > 0;
  const isVideosNoRef = filter.kind === "videos-no-ref";
  const isVideosWithRef = filter.kind === "videos-with-ref";

  const handleToggleFav = (id: string) => {
    const r = toggleFav(id);
    if (r === "added") toast.success("Adicionado aos favoritos.");
    else toast("Removido dos favoritos.");
  };
  const openModal = (prompt: Prompt) => { setSelected(prompt); setModalOpen(true); };
  const handleSeeFavorites = () => { setFilter({ kind: "favorites" }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleReset = () => { setQuery(""); setFilter(ALL_FILTER); };
  const isFav = (id: string) => favIds.includes(id);
  const activeLabel = filterLabel(filter);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 min-h-0">
        <Sidebar filter={filter} onSelect={setFilter} />
        <MobileSidebar filter={filter} onSelect={setFilter} open={mobileOpen} onOpenChange={setMobileOpen} />
        <main className="flex-1 min-w-0">
          {/* Mobile header — cleaner, more compact */}
          <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border-subtle bg-background/90 px-3 sm:px-4 py-2.5 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-brand-gradient glow-purple"><Sparkles className="h-3.5 w-3.5 text-white" /></div>
              <div className="leading-tight">
                <p className="text-[13px] font-semibold tracking-wide">PromptVault</p>
                <p className="text-[9px] text-muted-foreground/50">{filtered.length} prompts</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" onClick={handleSeeFavorites} className="relative h-8 w-8 border border-border-card bg-white/5" aria-label="Ver favoritos">
                <Heart className="h-3.5 w-3.5 text-brand-pink" />
                {favIds.length > 0 && <span className="absolute -right-1 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-brand-pink px-1 text-[9px] font-bold text-black">{favIds.length}</span>}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="h-8 w-8 border border-border-card bg-white/5" aria-label="Abrir menu">
                <Menu className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Update Banner — responsive padding */}
          <div className="mx-3 sm:mx-6 lg:mx-8 mt-3 sm:mt-4 mb-0 rounded-xl border border-brand-pink/20 bg-gradient-to-r from-brand-pink/[0.08] via-brand-purple/[0.06] to-brand-cyan/[0.04] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-lg bg-brand-gradient shadow-md shadow-brand-purple/20">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] sm:text-sm font-semibold text-foreground">Atualização 12/09</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">Novos prompts e referências adicionados</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFilter({ kind: "novidades" })}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-brand-gradient px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-white shadow-sm hover:brightness-110 transition-all active:scale-95"
            >
              Ver novidades
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-7">
            {/* Desktop header */}
            <div className="hidden lg:block">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Galeria de Prompts</h1>
                  <p className="mt-1 text-sm text-muted-foreground/60">Escolha uma referência, veja o formato e copie o prompt pronto para usar.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-border-card bg-white/[0.03] px-4 py-2">
                    <LayoutGrid className="h-4 w-4 text-muted-foreground/50" />
                    <span className="text-sm font-semibold tabular-nums text-foreground">{filtered.length}</span>
                    <span className="text-xs text-muted-foreground/50">prompts</span>
                  </div>
                </div>
              </div>
            </div>

            <SearchBar query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} onOpenMenu={() => setMobileOpen(true)} />

            {/* Filter info bar — more compact on mobile */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[12px] sm:text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{visible.length}</span> de{" "}
                <span className="font-semibold text-foreground">{filtered.length}</span>
                {filter.kind !== "all" ? (
                  <> em <span className="font-semibold text-gradient-brand">{activeLabel}</span></>
                ) : (
                  <> prompts</>
                )}
              </p>
              {filter.kind === "updates" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1 text-[11px] font-medium text-brand-cyan">
                  <Sparkles className="h-3 w-3" /> Novidades no acervo
                </span>
              )}
              {filter.kind === "novidades" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                  <Sparkles className="h-3 w-3" /> Novidades
                </span>
              )}
            </div>

            {visible.length === 0 ? (
              <EmptyState onReset={handleReset} />
            ) : isVideosNoRef ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
                {visible.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
              </div>
            ) : isVideosWithRef ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                {visible.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {hasPreviewCards && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                    {previewCards.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
                  </div>
                )}
                {hasNoPreviewCards && (
                  <div className="pt-3 sm:pt-4">
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <div className="flex-1 h-px bg-white/10" />
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Film className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-[12px] sm:text-sm font-semibold tracking-wide">Sem referência visual</span>
                        <span className="rounded-md bg-white/5 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium tabular-nums">{noPreviewCards.length}</span>
                      </div>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
                      {noPreviewCards.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {hasMore && visible.length > 0 && (
              <div className="flex justify-center pt-2">
                <Button type="button" onClick={() => setPage((p) => p + 1)} variant="outline" className="h-10 sm:h-11 gap-2 rounded-full border-border-card bg-white/5 px-6 sm:px-7 text-[13px] sm:text-sm text-foreground hover:bg-white/10">
                  Ver mais<ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
      <footer className="mt-auto border-t border-border-subtle bg-background/60 backdrop-blur-xl">
        <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-lg bg-brand-gradient"><Sparkles className="h-3 w-3 text-white" /></div>
            <p className="text-[11px] sm:text-xs text-muted-foreground"><span className="font-semibold text-foreground">PromptVault</span>{" "}TikTok Shop · Seu acervo visual de prompts prontos para copiar, colar e usar.</p>
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground/70">{PROMPTS.length} prompts disponíveis</p>
        </div>
      </footer>
      <UpdateBanner onNavigate={(cat) => setFilter({ kind: "category", value: cat as any })} onNavigateNovidades={() => setFilter({ kind: "novidades" })} />
      <ManequimPopup onNavigate={() => setFilter({ kind: "category", value: "Selfie UGC" })} />
      <PromptModal prompt={selected} open={modalOpen} onOpenChange={setModalOpen} isFavorite={selected ? isFav(selected.id) : false} onToggleFavorite={handleToggleFav} />
    </div>
  );
}
