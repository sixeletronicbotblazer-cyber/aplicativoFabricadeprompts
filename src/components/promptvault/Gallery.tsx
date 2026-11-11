"use client";

import { useMemo, useState } from "react";
import { Gem, Heart, ChevronDown, Film, HelpCircle, LayoutGrid, Menu, Sparkles, Star, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROMPTS, type Prompt, hasWorkingVideo, hasWorkingImage } from "@/lib/prompts";
import { useFavoritesStore } from "@/lib/favorites-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { applyFilter, countFor, filterLabel, isPovPrompt, type Filter, ALL_FILTER } from "./filters";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { SearchBar } from "./SearchBar";
import { PromptCard } from "./PromptCard";
import { PromptModal } from "./PromptModal";
import { EmptyState } from "./EmptyState";
import { UsageGuidePopup } from "./UsageGuidePopup";

const PAGE_SIZE = 24;

export function Gallery() {
  const [filter, setFilterState] = useState<Filter>(ALL_FILTER);
  const [query, setQueryState] = useState("");
  const [page, setPage] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  /** Usage guide dialog (opened from the info bar and the "?" search button) */
  const [guideOpen, setGuideOpen] = useState(false);
  /** "Sem referência visual" section starts collapsed to reduce noise */
  const [noRefOpen, setNoRefOpen] = useState(false);

  const favIds = useFavoritesStore((s) => s.ids);
  const toggleFav = useFavoritesStore((s) => s.toggle);

  /** Chip counts for the quick-access row in the SearchBar */
  const counts = useMemo(() => ({
    all: countFor({ kind: "all" }, favIds),
    pov: countFor({ kind: "pov" }, favIds),
    videos: countFor({ kind: "videos-with-ref" }, favIds),
    novidades: countFor({ kind: "novidades" }, favIds),
    favorites: favIds.length,
  }), [favIds]);

  const setFilter = (f: Filter) => { setFilterState(f); setPage(0); };
  const setQuery = (q: string) => { setQueryState(q); setPage(0); };

  const filtered = useMemo(() => {
    const base = applyFilter(PROMPTS, filter, favIds);
    const q = query.trim().toLowerCase();
    const matched = q
      ? base.filter((p) => (
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        ))
      : base;

    /**
     * Sort: POV prompts WITH VIDEO first (featured mode — Supabase/Drive
     * references), then all videos, then working images, then no media.
     * POV prompts that are image-only follow the normal sequence.
     */
    const isFeaturedPov = (p: Prompt) => isPovPrompt(p) && hasWorkingVideo(p);
    return [...matched].sort((a, b) => {
      // Featured POV (with video) ALWAYS first — the most popular mode
      const aPov = isFeaturedPov(a) ? 1 : 0;
      const bPov = isFeaturedPov(b) ? 1 : 0;
      if (aPov !== bPov) return bPov - aPov;
      const aW = (hasWorkingVideo(a) ? 4 : 0) + (hasWorkingImage(a) ? 2 : 0) + (a.isNew ? 1 : 0);
      const bW = (hasWorkingVideo(b) ? 4 : 0) + (hasWorkingImage(b) ? 2 : 0) + (b.isNew ? 1 : 0);
      if (aW !== bW) return bW - aW;
      return a.category.localeCompare(b.category) || a.title.localeCompare(b.title);
    });
  }, [filter, query, favIds]);

  const visibleCount = PAGE_SIZE * (page + 1);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  /**
   * Check if a prompt has a usable preview (image or video from a working host).
   * Broken hosts (old Supabase 402, auroraprompts down) are excluded.
   */
  const hasWorkingPreview = (p: Prompt) => hasWorkingImage(p) || hasWorkingVideo(p);
  const isVideosNoRef = filter.kind === "videos-no-ref";
  const isVideosWithRef = filter.kind === "videos-with-ref";

  /** Total video count across ALL filtered (not just visible page) */
  const totalFilteredVideos = filtered.filter((p) => hasWorkingVideo(p)).length;

  /** Split visible cards into working-video, working-image, and no-preview sections */
  const isAllView = filter.kind === "all" || filter.kind === "pov";
  /** Featured POV = only prompts with a working video (Supabase/Drive).
   *  Image-only POV prompts follow the normal sequence below. */
  const isFeaturedPov = (p: Prompt) => isPovPrompt(p) && hasWorkingVideo(p);
  const povCards = isAllView ? visible.filter(isFeaturedPov) : [];
  const nonPov = isAllView ? visible.filter((p) => !isFeaturedPov(p)) : visible;
  /** Total featured POV videos across ALL filtered (not just visible page) */
  const totalFeaturedPov = isAllView ? filtered.filter(isFeaturedPov).length : 0;
  const bothMediaCards = nonPov.filter((p) => hasWorkingImage(p) && hasWorkingVideo(p));
  const workingVideoCards = nonPov.filter((p) => hasWorkingVideo(p) && !hasWorkingImage(p));
  const workingImageCards = nonPov.filter((p) => hasWorkingImage(p) && !hasWorkingVideo(p));
  const noPreviewCards = nonPov.filter((p) => !hasWorkingPreview(p));
  const totalVideoCards = workingVideoCards.length + bothMediaCards.length;
  const hasWorkingVideoCards = totalVideoCards > 0;
  const hasWorkingImageCards = workingImageCards.length > 0;
  const hasNoPreviewCards = noPreviewCards.length > 0;

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
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-brand-gradient glow-purple"><Gem className="h-3.5 w-3.5 text-white" /></div>
              <div className="leading-tight">
                <p className="text-[13px] font-semibold tracking-wide">Fábrica de Prompts</p>
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

          <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-7">
            {/* Desktop header */}
            <div className="hidden lg:block">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">Galeria de Prompts</h1>
                  <p className="mt-1 text-sm text-muted-foreground/60">Escolha uma referência, veja o formato e copie o prompt pronto para usar.</p>
                </div>
                <div className="flex items-center gap-3">
                  {totalFilteredVideos > 0 && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2">
                      <Video className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-bold tabular-nums text-emerald-400">{totalFilteredVideos}</span>
                      <span className="text-xs text-emerald-400/60">vídeos</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 rounded-xl border border-border-card bg-white/[0.03] px-4 py-2">
                    <LayoutGrid className="h-4 w-4 text-muted-foreground/50" />
                    <span className="text-sm font-semibold tabular-nums text-foreground">{filtered.length}</span>
                    <span className="text-xs text-muted-foreground/50">prompts</span>
                  </div>
                </div>
              </div>
            </div>

            <SearchBar query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} onOpenMenu={() => setMobileOpen(true)} onOpenGuide={() => setGuideOpen(true)} counts={counts} />

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
              <div className="flex items-center gap-2">
                {filter.kind === "pov" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-orange-500/15 px-3 py-1 text-[11px] font-bold text-amber-200">
                    <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> POV em destaque — o modo mais usado
                  </span>
                )}
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
                <button
                  type="button"
                  onClick={() => setGuideOpen(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-card bg-white/[0.03] px-3 text-[12px] sm:text-[13px] font-medium text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Como usar
                </button>
              </div>
            </div>

            {visible.length === 0 ? (
              <EmptyState onReset={handleReset} />
            ) : isVideosNoRef ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                {visible.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
              </div>
            ) : isVideosWithRef ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                {visible.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
              </div>
            ) : (
              <div className="space-y-5 sm:space-y-7">
                {/* ── POV EM DESTAQUE (MODO MAIS USADO — SÓ VÍDEOS) ── */}
                {povCards.length > 0 && (
                  <div className="relative rounded-2xl border border-amber-400/25 bg-gradient-to-b from-amber-500/[0.09] via-amber-500/[0.04] to-transparent p-3 sm:p-4 shadow-lg shadow-amber-500/[0.06]">
                    <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4 px-1">
                      <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
                        <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white fill-white" />
                      </div>
                      <h2 className="text-sm sm:text-base font-bold bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent tracking-wide">Modo POV — Os mais usados</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-400/30 px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-bold tabular-nums text-amber-300">
                        <Video className="h-3 w-3" />{totalFeaturedPov} vídeos
                      </span>
                      <div className="flex-1 h-px bg-amber-400/15" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                      {povCards.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} hidePovBadge />)}
                    </div>
                  </div>
                )}

                {/* ── VÍDEOS FUNCIONAIS (PRIORIDADE MÁXIMA) ── */}
                {hasWorkingVideoCards && (
                  <div>
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                        <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                      </div>
                      <h2 className="text-sm sm:text-base font-bold text-emerald-400 tracking-wide">Vídeos com Referência</h2>
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-bold tabular-nums text-emerald-400">{totalVideoCards}</span>
                      <div className="flex-1 h-px bg-emerald-500/15" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                      {bothMediaCards.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
                      {workingVideoCards.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
                    </div>
                  </div>
                )}

                {/* ── REFERÊNCIAS VISUAIS (imagens) ── */}
                {hasWorkingImageCards && (
                  <div>
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg bg-brand-cyan/15 border border-brand-cyan/25">
                        <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-cyan" />
                      </div>
                      <h2 className="text-sm sm:text-base font-bold text-brand-cyan tracking-wide">Referências Visuais</h2>
                      <span className="rounded-full bg-brand-cyan/10 border border-brand-cyan/20 px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-bold tabular-nums text-brand-cyan">{workingImageCards.length}</span>
                      <div className="flex-1 h-px bg-brand-cyan/15" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                      {workingImageCards.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
                    </div>
                  </div>
                )}

                {/* ── SEM REFERÊNCIA VISUAL (colapsável, fechado por padrão) ── */}
                {hasNoPreviewCards && (
                  <div className="pt-3 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => setNoRefOpen((v) => !v)}
                      aria-expanded={noRefOpen}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white/[0.02] px-4 py-3 text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
                    >
                      <Film className="h-4 w-4 shrink-0" />
                      <span className="text-[12px] sm:text-sm font-semibold tracking-wide">Sem referência visual</span>
                      <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] sm:text-xs font-medium tabular-nums">{noPreviewCards.length}</span>
                      <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", noRefOpen && "rotate-180")} />
                    </button>
                    {noRefOpen && (
                      <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                        {noPreviewCards.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} isFavorite={isFav(prompt.id)} onToggleFavorite={handleToggleFav} onOpen={openModal} />)}
                      </div>
                    )}
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
            <div className="grid h-6 w-6 place-items-center rounded-lg bg-brand-gradient"><Gem className="h-3 w-3 text-white" /></div>
            <p className="text-[11px] sm:text-xs text-muted-foreground"><span className="font-semibold text-foreground">Fábrica de Prompts</span>{" "}TikTok Shop · Seu acervo visual de prompts prontos para copiar, colar e usar.</p>
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground/70">{PROMPTS.length} prompts disponíveis</p>
        </div>
      </footer>
      <PromptModal prompt={selected} open={modalOpen} onOpenChange={setModalOpen} isFavorite={selected ? isFav(selected.id) : false} onToggleFavorite={handleToggleFav} />
      <UsageGuidePopup open={guideOpen} onOpenChange={setGuideOpen} />
    </div>
  );
}
