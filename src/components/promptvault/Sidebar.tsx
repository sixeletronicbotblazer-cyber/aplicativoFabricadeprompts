"use client";

import { useState } from "react";
import {
  LayoutGrid,
  Image as ImageIcon,
  Film,
  Camera,
  Eye,
  User,
  Hand,
  ShoppingCart,
  ScanFace,
  Heart,
  RefreshCw,
  LifeBuoy,
  LogOut,
  UserCircle,
  Sparkles,
  X,
  Target,
  PawPrint,
  Baby,
  TreePine,
  Zap,
  ArrowRightLeft,
  Users,
  Move,
  Shirt,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/lib/auth-store";
import { useFavoritesStore } from "@/lib/favorites-store";
import { toast } from "sonner";
import { countFor, filterKey, type Filter } from "./filters";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ElementType;
  filter: Filter;
  isNew?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  defaultOpen: boolean;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "PRINCIPAL",
    defaultOpen: true,
    items: [
      { label: "Todos os prompts", icon: LayoutGrid, filter: { kind: "all" } },
      { label: "Novidades", icon: Sparkles, filter: { kind: "novidades" }, isNew: true },
      { label: "Imagem", icon: ImageIcon, filter: { kind: "type", value: "Imagem" } },
      { label: "Vídeo", icon: Film, filter: { kind: "videos-with-ref" } },
      { label: "Vídeos Parte 2", icon: Film, filter: { kind: "videos-no-ref" } },
    ],
  },
  {
    title: "ESTILO & MODA",
    defaultOpen: true,
    items: [
      { label: "UGC", icon: Camera, filter: { kind: "category", value: "UGC" } },
      { label: "POV", icon: Eye, filter: { kind: "category", value: "POV" } },
      { label: "POV Avançado", icon: Target, filter: { kind: "category", value: "POV Avançado" } },
      { label: "Selfie", icon: User, filter: { kind: "category", value: "Selfie" } },
      { label: "Produto", icon: Hand, filter: { kind: "category", value: "Produto" } },
      { label: "Moda", icon: Shirt, filter: { kind: "category", value: "Moda" }, isNew: true },
      { label: "Masculino", icon: User, filter: { kind: "category", value: "Masculino" }, isNew: true },
      { label: "Casal", icon: Users, filter: { kind: "category", value: "Casal" }, isNew: true },
      { label: "Lingerie", icon: Heart, filter: { kind: "category", value: "Lingerie" }, isNew: true },
      { label: "Movimento", icon: Move, filter: { kind: "category", value: "Movimento" }, isNew: true },
    ],
  },
  {
    title: "TEMAS",
    defaultOpen: true,
    items: [
      { label: "Natal", icon: TreePine, filter: { kind: "category", value: "Natal" }, isNew: true },
      { label: "Ganchos", icon: Zap, filter: { kind: "category", value: "Gancho" }, isNew: true },
      { label: "Transições", icon: ArrowRightLeft, filter: { kind: "category", value: "Transição" }, isNew: true },
      { label: "PET", icon: PawPrint, filter: { kind: "category", value: "PET" } },
      { label: "Infantil", icon: Baby, filter: { kind: "category", value: "Infantil" } },
    ],
  },
  {
    title: "TikTok",
    defaultOpen: false,
    items: [
      { label: "TikTok Shop", icon: ShoppingCart, filter: { kind: "category", value: "TikTok Shop" } },
      { label: "Identidade AI", icon: ScanFace, filter: { kind: "category", value: "Identidade AI" } },
      { label: "Selfie UGC", icon: Camera, filter: { kind: "category", value: "Selfie UGC" } },
    ],
  },
  {
    title: "MEUS",
    defaultOpen: true,
    items: [
      { label: "Favoritos", icon: Heart, filter: { kind: "favorites" } },
      { label: "Atualizações", icon: RefreshCw, filter: { kind: "updates" } },
    ],
  },
];

interface SidebarContentProps {
  filter: Filter;
  onSelect: (f: Filter) => void;
  onClose?: () => void;
}

function SidebarContent({ filter, onSelect, onClose }: SidebarContentProps) {
  const logout = useAuthStore((s) => s.logout);
  const favIds = useFavoritesStore((s) => s.ids);
  const activeKey = filterKey(filter);

  // Track open/closed state for each section; initialize from defaultOpen
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const sec of NAV_SECTIONS) {
      init[sec.title] = sec.defaultOpen;
    }
    return init;
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSelect = (f: Filter) => {
    onSelect(f);
    onClose?.();
  };

  const handleAccount = () => {
    toast.info("PromptVault", {
      description: "Você está conectado ao acervo exclusivo.",
    });
    onClose?.();
  };

  const handleSupport = () => {
    toast.info("Suporte PromptVault", {
      description: "Envie um e-mail para suporte@promptvault.app — responderemos em até 24h.",
    });
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    toast.success("Você saiu do acervo. Até logo!");
    onClose?.();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient glow-purple">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-wide">PromptVault</p>
            <p className="text-[10px] text-muted-foreground/60">TikTok Shop</p>
          </div>
        </div>
        {onClose && (
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overscroll-contain scrollbar-premium px-3 py-2">
        <div className="space-y-1">
          {NAV_SECTIONS.map((section) => {
            const isOpen = openSections[section.title] ?? section.defaultOpen;
            return (
              <div key={section.title}>
                {/* Section header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className="flex w-full items-center gap-1.5 px-2.5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/35 hover:text-muted-foreground/55 transition-colors"
                >
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 shrink-0 transition-transform duration-200",
                      isOpen && "rotate-0",
                      !isOpen && "-rotate-90"
                    )}
                  />
                  {section.title}
                </button>

                {/* Section items */}
                {isOpen && (
                  <div className="space-y-0.5 pb-1">
                    {section.items.map((item) => {
                      const active = activeKey === filterKey(item.filter);
                      const Icon = item.icon;
                      const count = countFor(item.filter, favIds);
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleSelect(item.filter)}
                          className={cn(
                            "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all",
                            active
                              ? "bg-brand-purple/15 text-white"
                              : "text-muted-foreground/60 hover:bg-white/[0.04] hover:text-foreground"
                          )}
                        >
                          <span
                            className={cn(
                              "grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors",
                              active
                                ? "bg-brand-gradient text-white shadow-sm"
                                : "bg-white/[0.04] text-muted-foreground/40 group-hover:text-foreground"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="flex-1 text-left font-medium">
                            {item.label}
                            {item.isNew && (
                              <span className="ml-1.5 inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/20 px-1 py-px text-[7px] font-bold uppercase tracking-wider text-emerald-300">
                                NOVO
                              </span>
                            )}
                          </span>
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 text-[10px] tabular-nums",
                              active
                                ? "bg-white/10 text-white/80"
                                : "bg-white/[0.03] text-muted-foreground/35"
                            )}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* CONTA section */}
      <div className="border-t border-border-subtle px-3 py-3 space-y-0.5">
        <p className="px-2.5 pb-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/35">
          Conta
        </p>
        <button
          type="button"
          onClick={handleAccount}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground/60 transition-all hover:bg-white/[0.04] hover:text-foreground"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/[0.04]">
            <UserCircle className="h-3.5 w-3.5" />
          </span>
          <span className="flex-1 text-left font-medium">Minha conta</span>
        </button>
        <button
          type="button"
          onClick={handleSupport}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground/60 transition-all hover:bg-white/[0.04] hover:text-foreground"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/[0.04]">
            <LifeBuoy className="h-3.5 w-3.5" />
          </span>
          <span className="flex-1 text-left font-medium">Suporte</span>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-rose-300/90 transition-all hover:bg-rose-500/10 hover:text-rose-200"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-rose-500/10">
            <LogOut className="h-3.5 w-3.5" />
          </span>
          <span className="flex-1 text-left font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}

interface SidebarProps {
  filter: Filter;
  onSelect: (f: Filter) => void;
}

export function Sidebar({ filter, onSelect }: SidebarProps) {
  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-[260px] xl:w-[280px] shrink-0 flex-col border-r border-border-subtle bg-surface-sidebar">
      <SidebarContent filter={filter} onSelect={onSelect} />
    </aside>
  );
}

interface MobileSidebarProps extends SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({
  filter,
  onSelect,
  open,
  onOpenChange,
}: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[280px] max-w-[85vw] border-border-subtle bg-surface-sidebar/95 p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu de navegação</SheetTitle>
        </SheetHeader>
        <SidebarContent
          filter={filter}
          onSelect={onSelect}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
