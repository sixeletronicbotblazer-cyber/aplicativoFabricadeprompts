"use client";

import { useAuthStore } from "@/lib/auth-store";
import { LoginScreen } from "@/components/promptvault/LoginScreen";
import { Gallery } from "@/components/promptvault/Gallery";

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return isAuthenticated ? <Gallery /> : <LoginScreen />;
}
