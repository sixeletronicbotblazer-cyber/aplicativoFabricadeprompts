"use client";

import { useState, useTransition } from "react";
import { Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";

export function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const ok = login(email, code);
      if (!ok) {
        toast.error("Preencha seu e-mail e código de acesso.");
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
          <div className="glass-strong glow-soft rounded-3xl p-7 sm:p-9">
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-cyan" />
                Acesso protegido
              </span>
              <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">
                Entre no seu acervo de prompts
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Use o e-mail da compra e o código recebido para acessar a galeria.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">
                  Seu e-mail
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="voce@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10 bg-white/5 border-white/10 placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-sm">
                  Código de acesso
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="code"
                    type="text"
                    autoComplete="off"
                    placeholder="••••••"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-11 pl-10 bg-white/5 border-white/10 placeholder:text-muted-foreground/70 tracking-widest"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={pending}
                className="mt-2 h-11 w-full bg-brand-gradient text-white font-semibold hover:opacity-90 transition-opacity glow-purple border-0"
              >
                {pending ? "Entrando..." : "Acessar galeria"}
                {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-muted-foreground/80 leading-relaxed">
              O código é enviado após a compra. Caso não encontre, verifique seu
              e-mail ou suporte.
            </p>
          </div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground/60">
            PromptVault TikTok Shop · Acervo exclusivo para clientes
          </p>
        </div>
      </main>
    </div>
  );
}
