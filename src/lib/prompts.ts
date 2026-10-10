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
 * Supabase video files known to exist in the storage bucket.
 * Used to determine which prompts have working video previews.
 */
const KNOWN_SUPABASE_VIDEOS = new Set([
  "1pov-conjunto-video.mp4", "22-cta-capinha.mp4", "almofadas-natal-video.mp4",
  "arvore-de-natal-video.mp4", "banho-de-sol-2-video.mp4", "banho-de-sol-video.mp4",
  "caixa-bolinhas-decoracao-de-arvore-natal-video.mp4", "camisa-123-video.mp4",
  "camiseta-careta-video.mp4", "cta-gloss-video.mp4", "cta-modelo-video.mp4",
  "decoracao-natal-neutro-para-qualquer-decoracao-de-natal-video.mp4",
  "espelho-1-video.mp4", "estrela-arvore-de-natal-video.mp4",
  "fabrica-caminhao-video.mp4", "fabrica-video-1-video.mp4",
  "fabrica-video-2-video.mp4", "fabrica-video-3-video.mp4",
  "faceless-blusa-3-video.mp4", "faceless-blusa-video.mp4",
  "faceless-calca-2-video.mp4", "faceless-calca-3-video.mp4",
  "faceless-calca-video.mp4", "faceless-conjunto-video.mp4",
  "faceless-shorts-video.mp4", "faceless-vestido-video.mp4",
  "feminino-agachamento-video.mp4", "gancho-22-video.mp4",
  "gancho-arvore-de-natal-pet-video.mp4", "gancho-bolsa-caindo-video.mp4",
  "gancho-gatinho-arvore-natal-video.mp4", "gancho-oculos-cta-video.mp4",
  "gancho-papai-noel-video.mp4", "gancho-queimando-roupa-video.mp4",
  "gancho-transicao-pacote-pegando-fogo-video.mp4",
  "gancho-transicao-pov-isqueiro-video.mp4", "gloss-viral-video.mp4",
  "gloss-viralizado-video.mp4", "jogo-americano-suplas-video.mp4",
  "masculino-religio-video.mp4", "metodo-chines-caixa-correio-video.mp4",
  "metodo-chines-ilha-de-promo-de-loja-video.mp4", "metodo-chines-video-roupa-video.mp4",
  "metodo-gringo_facelass_shop4-video.mp4", "metodo-gringo-faceless-shop-1-video.mp4",
  "metodo-gringo-faceless-shop-11-video.mp4", "metodo-gringo-faceless-shop-14-video.mp4",
  "metodo-gringo-faceless-shop-2-video.mp4", "metodo-gringo-faceless-shop-3-video.mp4",
  "metodo-gringo-faceless-shop-4-video.mp4", "metodo-gringo-faceless-shop-5-video.mp4",
  "metodo-gringo-faceless-shop-6-video.mp4", "metodo-gringo-faceless-shop-7-video.mp4",
  "metodo-gringo-faceless-shop-8-video.mp4", "metodo-gringo-faceless-shop-9-video.mp4",
  "metodo-gringo-faceless-shop5-video.mp4",
  "metodo-gringo-transicao-faceless-shop-2-video.mp4",
  "metodo-gringo-transicao-faceless-shop-video.mp4",
  "metodo-gringo-transicao-faceless-shop3-video.mp4",
  "movimento-blusa-time-beijo-video.mp4", "movimento-roupa-video.mp4",
  "pov-abrindo-saco-video.mp4", "pov-adicionando-pecas-em-cena-video.mp4",
  "pov-cabide-qualquer-roupa-video.mp4", "pov-caindo-roupas-na-cama-video.mp4",
  "pov-calcado-video.mp4", "pov-calcinhas-video.mp4",
  "pov-conjunto-lingerie-video.mp4", "pov-conjunto-video.mp4",
  "pov-croppedblusa-video.mp4", "pov-esmalte-video.mp4",
  "pov-esmalte2-video.mp4", "pov-roupa-video.mp4",
  "pov-saco-transparente-video.mp4", "pov-sutia-video.mp4",
  "pov-tirando-do-pacote-video.mp4", "pov-unhas-video.mp4",
  "prompt-fone-grande-video.mp4", "rimel-ugc-video.mp4",
  "transicao-aparecendo-produto-neutro-para-qualquer-produto-video-final.mp4",
  "transicao-celular-video.mp4", "transicao-chiclete-modelo-video.mp4",
  "transicao-roupa-neutro-video.mp4", "ugc-batom-video.mp4",
  "ugc-blush-cena-2-video.mp4", "ugc-blush-video.mp4",
  "ugc-bolsa-video.mp4", "ugc-calcado-video.mp4",
  "ugc-capinha-celular-video.mp4", "ugc-creme-estrias-video.mp4",
  "ugc-espalhando-creme-de-estrias-video.mp4", "ugc-limpando-rosto-video.mp4",
  "ugc-maquiagem-video.mp4", "ugc-oculos-video.mp4",
  "ugc-pacote-cena-1-e-2-video.mp4", "ugc-passando-creme-video.mp4",
  "ugc-passando-perfume-video.mp4", "ugc-pasta-de-dente-video.mp4",
  "ugc-rimel-video.mp4",
]);

/**
 * Supabase image files known to exist in the storage bucket.
 */
const KNOWN_SUPABASE_IMAGES = new Set([
  "cta-gloss-imagem.webp", "gancho-oculos-cta-foto.webp", "gloss-viral-imagem.webp",
  "gloss-viralizado-imagem.webp", "masculino-religio-imagem.webp",
  "metodo-gringo-faceless-shop-1-imagem-1.webp", "metodo-gringo-faceless-shop-2-imagem.webp",
  "metodo-gringo-faceless-shop-4-imagem.webp", "metodo-gringo-faceless-shop-6-imagem.webp",
  "metodo-gringo-faceless-shop-7-imagem.webp",
  "metodo-gringo-transicao-faceless-shop-2-imagem-1.webp",
  "metodo-gringo-transicao-faceless-shop-2-imagem-2.webp",
  "metodo-gringo-transicao-faceless-shop-imagem-1.webp",
  "metodo-gringo-transicao-faceless-shop-imagem-2.webp",
  "pov-abrindo-saco-imagem-1.webp", "pov-abrindo-saco-imagem-2.webp",
  "pov-adicionando-pecas-em-cena-imagem.webp", "pov-cabide-qualquer-roupa-imagem.webp",
  "pov-caindo-roupas-na-cama-cena-1.webp", "pov-caindo-roupas-na-cama-cena-2.webp",
  "pov-calcado-imagem-1.webp", "pov-calcinhas-imagem.webp",
  "pov-conjunto-imagem.webp", "pov-croppedblusa-imagem.webp",
  "pov-esmalte-imagem.webp", "pov-roupa-imagem-1.webp",
  "pov-saco-transparente-imagem-1.webp", "pov-sutia-imagem.webp",
  "pov-tirando-do-pacote-imagem-1.webp", "pov-unhas-imagem.webp",
  "prompt-fone-grande-2-imagem.webp", "prompt-fone-grande-imagem.webp",
  "rimel-ugc-imagem.webp",
  "transicao-aparecendo-produto-neutro-para-qualquer-produto-imagem-1.webp",
  "transicao-aparecendo-produto-neutro-para-qualquer-produto-imagem-2-modelo.webp",
  "ugc-batom-imagem.webp", "ugc-blush-cena-1-imagem.webp",
  "ugc-blush-imagem.webp", "ugc-bolsa-imagem.webp",
  "ugc-calcado-tenis-caixa.webp", "ugc-calcado-ugc-segurando-caixa.webp",
  "ugc-capinha-celular-imagem.webp", "ugc-creme-estrias-imagem.webp",
  "ugc-espalhando-creme-de-estrias-imagem.webp", "ugc-limpando-rosto-imagem.webp",
  "ugc-maquiagem-imagem.webp", "ugc-oculos-imagem.webp",
  "ugc-pacote-cena-1-imagem.webp", "ugc-pacote-cena-2-imagem.webp",
  "ugc-passando-creme-imagem.webp", "ugc-passando-perfume-imagem.webp",
  "ugc-pasta-de-dente-imagem.webp", "ugc-rimel-imagem.webp",
  "versao-22-cta-celular.webp",
]);

/**
 * Check if a prompt has a working video (exists in Supabase storage).
 */
export function hasWorkingVideo(prompt: Prompt): boolean {
  if (!prompt.videoUrl) return false;
  const filename = prompt.videoUrl.split("/").pop()?.split("?")[0]?.split("#")[0] ?? "";
  return KNOWN_SUPABASE_VIDEOS.has(filename);
}

/**
 * Check if a prompt has a working image (exists in Supabase storage).
 */
export function hasWorkingImage(prompt: Prompt): boolean {
  if (!prompt.image) return false;
  const filename = prompt.image.split("/").pop()?.split("?")[0]?.split("#")[0] ?? "";
  return KNOWN_SUPABASE_IMAGES.has(filename);
}

/**
 * Check if a prompt has any working media (video or image).
 */
export function hasWorkingMedia(prompt: Prompt): boolean {
  return hasWorkingVideo(prompt) || hasWorkingImage(prompt);
}
