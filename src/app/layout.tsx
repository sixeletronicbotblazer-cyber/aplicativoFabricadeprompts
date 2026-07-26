import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromptVault TikTok Shop — Acervo de Prompts",
  description:
    "Seu acervo visual de prompts prontos para copiar, colar e usar em vídeos de TikTok Shop e Shopee com IA.",
  keywords: [
    "PromptVault",
    "TikTok Shop",
    "prompts",
    "IA",
    "UGC",
    "vídeo",
    "Shopee",
  ],
  authors: [{ name: "PromptVault" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "PromptVault TikTok Shop",
    description:
      "Seu acervo visual de prompts prontos para copiar, colar e usar.",
    siteName: "PromptVault",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          theme="dark"
          toastOptions={{
            style: {
              background: "oklch(0.16 0.014 285 / 0.95)",
              border: "1px solid oklch(1 0 0 / 0.12)",
              color: "oklch(0.97 0.005 285)",
              backdropFilter: "blur(16px)",
            },
          }}
        />
      </body>
    </html>
  );
}
