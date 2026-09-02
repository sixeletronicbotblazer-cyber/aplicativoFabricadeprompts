"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, X, Smartphone } from "lucide-react";

/**
 * Captures the native `beforeinstallprompt` event and shows a
 * discreet fixed banner at the bottom of the screen on mobile devices
 * so users can install PromptVault as an app.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem("pv-install-dismissed")) return;

    // Detect iOS Safari (no beforeinstallprompt)
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && !(ua as string).includes("CriOS")) {
      setIsIOS(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      (deferredPrompt as unknown as { prompt: () => Promise<void> }).prompt();
      setDeferredPrompt(null);
    }
    setDismissed(true);
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pv-install-dismissed", "1");
  };

  // Don't render if: already installed, dismissed, no prompt & not iOS, or desktop
  const isStandalone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;
  const isMobile =
    typeof window !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isStandalone || dismissed || (!deferredPrompt && !isIOS) || !isMobile)
    return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="mx-3 mb-3 rounded-2xl border border-white/10 bg-card/95 backdrop-blur-2xl p-4 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold leading-tight text-foreground">
              Instalar no celular
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
              {isIOS
                ? "Toque no ícone de compartilhar e depois em 'Adicionar à Tela de Início'."
                : "Acesse como um app — sem navegador, direto na tela inicial."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleInstall}
          className="mt-3 flex w-full items-center justify-center gap-2 h-10 rounded-xl bg-brand-gradient text-white text-[13px] font-semibold hover:brightness-110 transition-all active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          {isIOS ? "Ver instruções" : "Instalar app"}
        </button>
      </div>
    </div>
  );
}
