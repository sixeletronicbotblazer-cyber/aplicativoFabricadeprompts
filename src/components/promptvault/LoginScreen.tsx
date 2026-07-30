"use client";

import { useState, useTransition } from "react";
import { Lock, ArrowRight, Sparkles, ShieldCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "5561996292397";
const WHATSAPP_MSG = encodeURIComponent(
  "Olá! Gostaria de solicitar o código de acesso ao PromptVault."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;

export function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const ok = login(code);
      if (!ok) {
        toast.error("Código incorreto. Verifique e tente novamente.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setCode("");
        return;
      }
      toast.success("Acesso liberado. Bem-vindo ao seu acervo.");
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background image + gradient veil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          backgroundImage: "url(/prompts/login-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.45,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/85 to-background"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 -z-10 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--brand-purple), transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 -z-10 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--brand-cyan), transparent)" }}
      />

      {/* Brand bar */}
      <header className="px-5 sm:px-8 pt-7">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient glow-purple">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-wide">PromptVault</p>
            <p className="text-[11px] text-muted-foreground">TikTok Shop</p>
          </div>
        </div>
      </header>

      {/* Centered card */}
      <main className="flex flex-1 items-center justify-center px-5 sm:px-8 py-10">
        <div className="w-full max-w-md animate-fade-in">
          <div
            className={`glass-strong glow-soft rounded-3xl p-7 sm:p-9 transition-transform ${shake ? "animate-shake" : ""}`}
          >
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-cyan" />
                Acesso protegido
              </span>
              <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">
                Entre no seu acervo
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Digite o código de acesso para entrar na galeria de prompts.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-sm">
                  Código de acesso
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    autoFocus
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-12 pl-10 text-center text-lg tracking-[0.3em] font-mono bg-white/5 border-white/10 placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={pending || code.length === 0}
                className="mt-2 h-12 w-full bg-brand-gradient text-white font-semibold hover:opacity-90 transition-opacity glow-purple border-0 text-base"
              >
                {pending ? "Verificando..." : "Acessar galeria"}
                {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            {/* WhatsApp CTA */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-transparent px-3 text-muted-foreground/60">
                    Não tem o código?
                  </span>
                </div>
              </div>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/40"
              >
                <MessageCircle className="h-4.5 w-4.5" />
                Solicitar código de acesso
              </a>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground/60">
            PromptVault TikTok Shop · Acervo exclusivo para clientes
          </p>
        </div>
      </main>
    </div>
  );
}
