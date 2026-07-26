"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { LoginScreen } from "@/components/promptvault/LoginScreen";
import { Gallery } from "@/components/promptvault/Gallery";

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  // Standard client-only mount guard to avoid a hydration flash before the
  // persisted auth store rehydrates from localStorage.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Avoid hydration flash before the persisted store hydrates
    return <div className="min-h-screen bg-background" />;
  }

  return isAuthenticated ? <Gallery /> : <LoginScreen />;
}
