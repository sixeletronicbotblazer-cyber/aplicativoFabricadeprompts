export type PromptType =
  | "Imagem"
  | "Vídeo"
  | "POV"
  | "Selfie"
  | "UGC"
  | "Produto";

export type PromptCategory =
  | "POV"
  | "UGC"
  | "Selfie"
  | "Produto"
  | "Moda"
  | "Masculino"
  | "Casal"
  | "Lingerie"
  | "Movimento"
  | "Natal"
  | "Gancho"
  | "Transição"
  | "PET"
  | "Infantil"
  | "TikTok Shop"
  | "Identidade AI"
  | "Imagem"
  | "Vídeo";

export interface Prompt {
  id: string;
  title: string;
  type: PromptType;
  category: PromptCategory;
  description: string;
  tags: string[];
  /** Reference image URL. Empty string => premium placeholder card. */
  image: string;
  /** Full prompt text — copied verbatim, never altered. */
  prompt: string;
  /** True quando há imagem sem prompt (card apenas visual de referência). */
  referencia?: boolean;
  recommended?: boolean;
  /** Contexto, tutorial e dicas de uso do prompt (quando aplicável). */
  explanation?: string;
  /** True para marcar como conteúdo novo/adicionado recentemente. */
  isNew?: boolean;
  /** External hosted video URL (for video-type prompts). */
  videoUrl?: string;
}

/**
 * Base de dados da galeria.
 */
import promptsData from "./prompts-data.json";

export const PROMPTS: Prompt[] = promptsData as unknown as Prompt[];

/**
 * Categorias disponíveis na sidebar (ordenadas por relevância de uso).
 */
export const CATEGORIES: PromptCategory[] = [
  "POV",
  "UGC",
  "Selfie",
  "Produto",
  "Moda",
  "Masculino",
  "Casal",
  "Lingerie",
  "Movimento",
  "Natal",
  "Gancho",
  "Transição",
  "PET",
  "Infantil",
  "TikTok Shop",
  "Identidade AI",
  "Imagem",
  "Vídeo",
];

export const TYPE_BADGES: PromptType[] = [
  "Imagem",
  "Vídeo",
  "POV",
  "Selfie",
  "UGC",
  "Produto",
];

/** Conta prompts por categoria (para a sidebar). */
export function countByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of PROMPTS) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }
  return counts;
}

/**
 * Known broken hosts — old Supabase returns 402, auroraprompts.com is down,
 * i.imgur.com is blocked in this environment.
 * All URLs pointing to these hosts have been migrated to local /sb/ paths
 * or the new Supabase project (kwlsuylcowdldtaqaaou).
 */
const BROKEN_HOSTS = [
  "luoyccnsbgoxdhcqyvdb.supabase.co",
  "auroraprompts.com",
  "i.imgur.com",
  "imgur.com",
];

/**
 * Check if a URL points to a known broken host.
 */
function isBrokenHost(url: string | undefined): boolean {
  if (!url) return true;
  return BROKEN_HOSTS.some((h) => url.includes(h));
}

/**
 * Check if a URL is a local path (served from /public).
 */
function isLocalUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.startsWith("/");
}

/**
 * Check if a prompt has a working video.
 * Only returns true for URLs that are NOT from broken hosts.
 */
export function hasWorkingVideo(prompt: Prompt): boolean {
  if (!prompt.videoUrl) return false;
  if (isBrokenHost(prompt.videoUrl)) return false;
  return true;
}

/**
 * Check if a prompt has a working image.
 * Only returns true for URLs that are NOT from broken hosts.
 */
export function hasWorkingImage(prompt: Prompt): boolean {
  if (!prompt.image) return false;
  if (isBrokenHost(prompt.image)) return false;
  return true;
}

/**
 * Check if a prompt has any working media (video or image).
 */
export function hasWorkingMedia(prompt: Prompt): boolean {
  return hasWorkingVideo(prompt) || hasWorkingImage(prompt);
}
