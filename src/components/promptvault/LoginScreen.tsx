"use client";

import { useState, useTransition } from "react";
import {
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Mail,
  AlertTriangle,
  XCircle,
  LifeBuoy,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore, generateCodeForEmail, type LoginResult } from "@/lib/auth-store";
import { copyText } from "@/lib/copy";
import { cn } from "@/lib/utils";

export function LoginScreen() {
  const loginFn = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();
  const [shake, setShake] = useState(false);
  const [error, setError] = useState<LoginResult["reason"] | null>(null);
  const [blocked, setBlocked] = useState(false);

  // Code generation state
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const resetError = () => {
    setError(null);
    setBlocked(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetError();
    startTransition(() => {
      const result = loginFn(email, code);
      if (!result.ok) {
        if (result.reason === "blocked") {
          setBlocked(true);
        } else {
          setError(result.reason);
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setCode("");
        }
      }
    });
  };

  const handleGenerateCode = () => {
    if (!email.trim()) return;
    const gen = generateCodeForEmail(email);
    setGeneratedCode(gen);
    setCopiedCode(false);
  };

  const handleCopyCode = async () => {
    if (!generatedCode) return;
    const ok = await copyText(generatedCode);
    if (ok) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  /* ───── Blocked state ───── */
  if (blocked) {
    return (
      <div className="relative min-h-screen flex flex-col overflow-hidden">
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

        <main className="flex flex-1 items-center justify-center px-5 sm:px-8 py-10">
          <div className="w-full max-w-md animate-fade-in">
            <div className="glass-strong glow-soft rounded-3xl p-7 sm:p-9">
              <div className="flex flex-col items-center text-center">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-rose-500/15 border border-rose-500/25">
                  <XCircle className="h-8 w-8 text-rose-400" />
                </div>
                <h1 className="mt-5 text-2xl font-semibold tracking-tight">
                  Acesso bloqueado
                </h1>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
                  Seu acesso ao acervo foi desativado. Se você acredita que isso
                  é um erro, entre em contato com o suporte.
                </p>
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

  /* ───── Normal login ───── */
  const errorMessage =
    error === "wrong_code"
      ? "Código incorreto. Gere seu código e tente novamente."
      : error === "empty_email"
        ? "Insira seu email para continuar."
        : null;

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
            className={cn(
              "glass-strong glow-soft rounded-3xl p-7 sm:p-9 transition-transform",
              shake ? "animate-shake" : ""
            )}
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
                Digite seu email, gere seu código e acesse a galeria.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">
                  Seu email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setGeneratedCode(null);
                      resetError();
                    }}
                    className="h-12 pl-10 text-sm bg-white/5 border-white/10 placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {/* Gerar código de acesso */}
              <Button
                type="button"
                onClick={handleGenerateCode}
                disabled={!email.trim()}
                className="h-12 w-full gap-2 border-0 rounded-xl text-sm font-semibold transition-all bg-brand-gradient text-white hover:brightness-110 glow-purple"
              >
                <KeyRound className="h-4 w-4" />
                Gerar código de acesso
              </Button>

              {/* Generated code display */}
              {generatedCode && (
                <div className="rounded-xl border border-brand-purple/30 bg-brand-purple/[0.08] p-4 animate-fade-in">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-purple mb-2">
                    Seu código de acesso
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex-1 text-2xl font-mono font-bold tracking-[0.4em] text-foreground select-all">
                      {generatedCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-all active:scale-95",
                        copiedCode
                          ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:border-white/20"
                      )}
                      aria-label="Copiar código"
                    >
                      {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground/60">
                    Copie o código e cole no campo abaixo
                  </p>
                </div>
              )}

              {/* Code input */}
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
                    placeholder="Cole aqui"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      resetError();
                    }}
                    className="h-12 pl-10 text-center text-lg tracking-[0.3em] font-mono bg-white/5 border-white/10 placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-200 leading-relaxed">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={pending || email.length === 0 || code.length === 0}
                className="mt-2 h-12 w-full bg-brand-gradient text-white font-semibold hover:opacity-90 transition-opacity glow-purple border-0 text-base"
              >
                {pending ? "Verificando..." : "Acessar galeria"}
                {!pending && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground/60">
            PromptVault TikTok Shop · Acervo exclusivo para clientes
          </p>
        </div>
      </main>
    </div>
  );
}
