"use client";

import { useMemo, useState } from "react";
import { Sparkles, Heart, ChevronDown, Film, ArrowRight, Zap } from "lucide-react";
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
  const hasPreview = (p: Prompt) => Boolean(p.image) || Boolean(p.videoUrl);
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
          <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-background/80 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-gradient glow-purple"><Sparkles className="h-4 w-4 text-white" /></div>
              <div className="leading-tight"><p className="text-sm font-semibold tracking-wide">PromptVault</p><p className="text-[10px] text-muted-foreground">TikTok Shop</p></div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSeeFavorites} className="relative h-9 w-9 border border-white/10 bg-white/5" aria-label="Ver favoritos">
              <Heart className="h-4 w-4 text-brand-pink" />
              {favIds.length > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-pink px-1 text-[10px] font-bold text-black">{favIds.length}</span>}
            </Button>
          </div>
          {/* Update 12/09 Banner */}
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 mb-0 rounded-xl border border-brand-pink/20 bg-gradient-to-r from-brand-pink/[0.08] via-brand-purple/[0.06] to-brand-cyan/[0.04] px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-gradient shadow-md shadow-brand-purple/20">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Atualização 12/09</p>
                <p className="text-[11px] text-muted-foreground truncate">Novos prompts, formatos e referências adicionados à biblioteca</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFilter({ kind: "novidades" })}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-brand-gradient px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110 transition-all active:scale-95"
            >
              Ver novidades
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-7">
            <SearchBar query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} onOpenMenu={() => setMobileOpen(true)} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Mostrando <span className="font-semibold text-foreground">{visible.length}</span> de{" "}
                <span className="font-semibold text-foreground">{filtered.length}</span> prompts
                {filter.kind !== "all" && (<> em <span className="font-semibold text-gradient-brand">{activeLabel}</span></>)}
              </p>
              {filter.kind === "updates" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1 text-[11px] font-medium text-brand-cyan">
                  <Sparkles className="h-3 w-3" /> Novidades no acervo
                </span>
              )}
            </div>
            {visible.length === 0 ? (
              <EmptyState onReset={handleReset} />
            ) : isVideosNoRef ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                {visible.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
              </div>
            ) : isVideosWithRef ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {visible.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
              </div>
            ) : (
              <div className="space-y-6">
                {hasPreviewCards && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {previewCards.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
                  </div>
                )}
                {hasNoPreviewCards && (
                  <div className="pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-white/10" />
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Film className="h-4 w-4" />
                        <span className="text-sm font-semibold tracking-wide">Sem referência visual</span>
                        <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-medium tabular-nums">{noPreviewCards.length}</span>
                      </div>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                      {noPreviewCards.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
            {hasMore && visible.length > 0 && (
              <div className="flex justify-center pt-2">
                <Button type="button" onClick={() => setPage((p) => p + 1)} variant="outline" className="h-11 gap-2 rounded-full border-white/10 bg-white/5 px-7 text-foreground hover:bg-white/10">
                  Ver mais prompts<ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
      <footer className="mt-auto border-t border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-brand-gradient"><Sparkles className="h-3.5 w-3.5 text-white" /></div>
            <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">PromptVault</span>{" "}TikTok Shop · Seu acervo visual de prompts prontos para copiar, colar e usar.</p>
          </div>
          <p className="text-[11px] text-muted-foreground/70">Acervo exclusivo para clientes · {PROMPTS.length} prompts disponíveis</p>
        </div>
      </footer>
      <UpdateBanner onNavigate={(cat) => setFilter({ kind: "category", value: cat as any })} onNavigateNovidades={() => setFilter({ kind: "novidades" })} />
      <ManequimPopup onNavigate={() => setFilter({ kind: "category", value: "Selfie UGC" })} />
      <PromptModal prompt={selected} open={modalOpen} onOpenChange={setModalOpen} isFavorite={selected ? isFav(selected.id) : false} onToggleFavorite={handleToggleFav} />
    </div>
  );
}
