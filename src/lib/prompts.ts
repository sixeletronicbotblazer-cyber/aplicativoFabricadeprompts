export type PromptType =
  | "Imagem"
  | "Vídeo"
  | "POV"
  | "Selfie"
  | "UGC"
  | "Produto";

export type PromptCategory =
  | "Selfie"
  | "POV"
  | "UGC"
  | "Roupas"
  | "Produto"
  | "Look no corpo"
  | "TikTok Shop"
  | "Shopee"
  | "Imagem"
  | "Vídeo"
  | "Identidade AI"
  | "Manequim";

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
 * Base de dados da galeria — extraída do documento enviado (Imagem.docx).
 *
 * Cada item segue a estrutura { id, title, type, category, description, tags,
 * image, prompt }. O texto dos prompts é preservado integralmente; apenas
 * organizado, formatado e tornado copiável.
 *
 * Para atualizar o acervo, substitua este JSON ou gere-o novamente com o
 * parser em `parse_prompts.py` a partir de um novo documento.
 */
import promptsData from "./prompts-data.json";

export const PROMPTS: Prompt[] = promptsData as unknown as Prompt[];

/**
 * Categorias disponíveis na sidebar (ordenadas por relevância de uso).
 */
export const CATEGORIES: PromptCategory[] = [
  "POV",
  "Produto",
  "UGC",
  "Selfie",
  "Roupas",
  "TikTok Shop",
  "Shopee",
  "Imagem",
  "Vídeo",
  "Identidade AI",
  "Manequim",
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
