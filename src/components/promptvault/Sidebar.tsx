"use client";

import {
  LayoutGrid,
  Image as ImageIcon,
  Film,
  Camera,
  Eye,
  User,
  Shirt,
  Hand,
  ShoppingCart,
  ShoppingBag,
  ScanFace,
  Heart,
  RefreshCw,
  LifeBuoy,
  LogOut,
  UserCircle,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
}

const MAIN_NAV: NavItem[] = [
  { label: "Todos os prompts", icon: LayoutGrid, filter: { kind: "all" } },
  { label: "Imagem", icon: ImageIcon, filter: { kind: "type", value: "Imagem" } },
  { label: "Vídeo", icon: Film, filter: { kind: "type", value: "Vídeo" } },
  { label: "UGC", icon: Camera, filter: { kind: "category", value: "UGC" } },
  { label: "POV", icon: Eye, filter: { kind: "category", value: "POV" } },
  { label: "Selfie", icon: User, filter: { kind: "category", value: "Selfie" } },
  { label: "Roupas", icon: Shirt, filter: { kind: "category", value: "Roupas" } },
  { label: "Produto", icon: Hand, filter: { kind: "category", value: "Produto" } },
  {
    label: "TikTok Shop",
    icon: ShoppingCart,
    filter: { kind: "category", value: "TikTok Shop" },
  },
  {
    label: "Shopee",
    icon: ShoppingBag,
    filter: { kind: "category", value: "Shopee" },
  },
  {
    label: "Identidade AI",
    icon: ScanFace,
    filter: { kind: "category", value: "Identidade AI" },
  },
  { label: "Favoritos", icon: Heart, filter: { kind: "favorites" } },
  { label: "Atualizações", icon: RefreshCw, filter: { kind: "updates" } },
];

interface SidebarContentProps {
  filter: Filter;
  onSelect: (f: Filter) => void;
  onClose?: () => void;
}

function SidebarContent({ filter, onSelect, onClose }: SidebarContentProps) {
  const logout = useAuthStore((s) => s.logout);
  const email = useAuthStore((s) => s.email);
  const favIds = useFavoritesStore((s) => s.ids);
  const activeKey = filterKey(filter);

  const handleSelect = (f: Filter) => {
    onSelect(f);
    onClose?.();
  };

  const handleAccount = () => {
    toast.info(`Conta conectada: ${email ?? "—"}`, {
      description: "Gerencie seu acesso nas configurações da conta.",
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
            <p className="text-sm font-semibold tracking-wide">PromptVault</p>
            <p className="text-[11px] text-muted-foreground">TikTok Shop</p>
          </div>
        </div>
        {onClose && (
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground lg:hidden"
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        )}
      </div>
      <Separator className="bg-white/5" />

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-3 scrollbar-premium">
        <nav className="space-y-1">
          <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Navegação
          </p>
          {MAIN_NAV.map((item) => {
            const active = activeKey === filterKey(item.filter);
            const Icon = item.icon;
            const count = countFor(item.filter, favIds);
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSelect(item.filter)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                    active
                      ? "bg-brand-gradient text-white"
                      : "bg-white/5 text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                    active
                      ? "bg-white/15 text-white"
                      : "bg-white/5 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/5" />
      {/* Footer actions */}
      <div className="px-3 py-3 space-y-1">
        <button
          type="button"
          onClick={handleAccount}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5">
            <UserCircle className="h-4 w-4" />
          </span>
          <span className="flex-1 text-left font-medium">Minha conta</span>
        </button>
        <button
          type="button"
          onClick={handleSupport}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5">
            <LifeBuoy className="h-4 w-4" />
          </span>
          <span className="flex-1 text-left font-medium">Suporte</span>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-300/90 transition-all hover:bg-rose-500/10 hover:text-rose-200"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-500/10">
            <LogOut className="h-4 w-4" />
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
    <aside className="hidden lg:flex sticky top-0 h-screen w-72 shrink-0 flex-col border-r border-white/5 bg-sidebar/60 backdrop-blur-xl">
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
        className="w-[300px] max-w-[85vw] border-white/5 bg-sidebar/95 p-0"
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
