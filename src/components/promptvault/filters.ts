import {
  PROMPTS,
  type Prompt,
  type PromptCategory,
  type PromptType,
  hasWorkingVideo,
  hasWorkingImage,
  hasWorkingMedia,
  hasSupabaseVideo,
} from "@/lib/prompts";

export type Filter =
  | { kind: "all" }
  | { kind: "pov" }
  | { kind: "type"; value: PromptType }
  | { kind: "category"; value: PromptCategory }
  | { kind: "favorites" }
  | { kind: "recommended" }
  | { kind: "updates" }
  | { kind: "novidades" }
  | { kind: "videos-with-ref" }
  | { kind: "videos-no-ref" };

export const ALL_FILTER: Filter = { kind: "all" };

/** Stable string key for active-state comparison. */
export function filterKey(f: Filter): string {
  switch (f.kind) {
    case "all":
      return "all";
    case "pov":
      return "pov";
    case "favorites":
      return "favorites";
    case "recommended":
      return "recommended";
    case "updates":
      return "updates";
    case "novidades":
      return "novidades";
    case "type":
      return `type:${f.value}`;
    case "category":
      return `category:${f.value}`;
    case "videos-with-ref":
      return "videos-with-ref";
    case "videos-no-ref":
      return "videos-no-ref";

  }
}

/**
 * Check if a prompt is a POV prompt — the most popular mode.
 * Matches "POV" in title, category or type (and "Ponto de vista").
 */
export function isPovPrompt(p: Prompt): boolean {
  const t = (p.title || "").toLowerCase();
  const c = (p.category || "").toLowerCase();
  const ty = (p.type || "").toLowerCase();
  return t.includes("pov") || c.includes("pov") || ty === "pov" || t.includes("ponto de vista");
}

export function countFor(f: Filter, favIds: string[]): number {
  switch (f.kind) {
    case "all":
      return PROMPTS.length;
    case "pov":
      return PROMPTS.filter(isPovPrompt).length;
    case "favorites":
      return favIds.length;
    case "recommended":
      return PROMPTS.filter((p) => p.recommended).length;
    case "updates":
      return PROMPTS.filter((p) => p.isNew).length;
    case "novidades":
      return PROMPTS.filter((p) => p.isNew).length;
    case "type":
      return PROMPTS.filter((p) => p.type === f.value).length;
    case "category":
      return PROMPTS.filter((p) => p.category === f.value).length;
    case "videos-with-ref":
      return PROMPTS.filter((p) => p.type === "Vídeo" && hasWorkingMedia(p)).length;
    case "videos-no-ref":
      return PROMPTS.filter((p) => p.type === "Vídeo" && !hasWorkingMedia(p)).length;

  }
}

/**
 * Check if a prompt is "manequim" or "selfie" (should go to bottom in Vídeo tab).
 */
function isManequimOrSelfie(p: Prompt): boolean {
  const t = p.title.toLowerCase();
  const c = p.category.toLowerCase();
  return (
    t.includes("manequim") ||
    c.includes("selfie ugc") ||
    c === "selfie"
  );
}

/**
 * Sort for Vídeo tab (with ref): newest first, manequim/selfie at bottom.
 */
function sortVideoWithRef(list: Prompt[]): Prompt[] {
  return [...list].sort((a, b) => {
    // 1. Manequim/Selfie → bottom (1), others → top (0)
    const aBottom = isManequimOrSelfie(a) ? 1 : 0;
    const bBottom = isManequimOrSelfie(b) ? 1 : 0;
    if (aBottom !== bBottom) return aBottom - bBottom;
    // 2. New items first
    const aNew = a.isNew ? 0 : 1;
    const bNew = b.isNew ? 0 : 1;
    if (aNew !== bNew) return aNew - bNew;
    return 0;
  });
}

/** Has any media URL at all (even from broken hosts). */
function hasAnyMedia(p: Prompt): boolean {
  return Boolean(p.image) || Boolean(p.videoUrl);
}

/** Has usable prompt text (>10 chars) */
function hasPromptText(p: Prompt): boolean {
  return Boolean(p.prompt) && p.prompt.trim().length >= 10;
}

/**
 * Media quality score (LOWER = shown earlier):
 * 0 = Supabase video (BEST — our project, reliable, shown in destaque)
 * 1 = both working image + working video (non-Supabase)
 * 2 = working video only (non-Supabase, e.g. catbox)
 * 3 = working image only
 * 4 = has media but ALL broken (degraded — show last)
 * 5 = no media at all
 */
function mediaQualityScore(p: Prompt): number {
  const sbVid = hasSupabaseVideo(p);
  const wImg = hasWorkingImage(p);
  const wVid = hasWorkingVideo(p);
  if (sbVid) return 0;
  if (wImg && wVid) return 1;
  if (wVid) return 2;
  if (wImg) return 3;
  if (hasAnyMedia(p)) return 4;  // has URLs but all broken
  return 5;
}

/**
 * Sort helper: POV prompts with Supabase video FIRST (strict destaque),
 * then other Supabase videos, then working media, then broken media.
 */
function sortByReference(list: Prompt[]): Prompt[] {
  return [...list].sort((a, b) => {
    // 0. POV prompts WITH SUPABASE VIDEO first (the destaque — strictly ours).
    //    POV with catbox/image-only follows the normal sequence.
    const aPov = isPovPrompt(a) && hasSupabaseVideo(a) ? 0 : 1;
    const bPov = isPovPrompt(b) && hasSupabaseVideo(b) ? 0 : 1;
    if (aPov !== bPov) return aPov - bPov;
    // 1. New items first within group
    const aNew = a.isNew ? 0 : 1;
    const bNew = b.isNew ? 0 : 1;
    if (aNew !== bNew) return aNew - bNew;
    // 2. Media quality score (Supabase first, working media, broken last)
    const aScore = mediaQualityScore(a);
    const bScore = mediaQualityScore(b);
    if (aScore !== bScore) return aScore - bScore;
    // 3. Has prompt text first
    const aText = hasPromptText(a) ? 0 : 1;
    const bText = hasPromptText(b) ? 0 : 1;
    if (aText !== bText) return aText - bText;
    // 4. Images before videos
    const aVid = a.type === "Vídeo" ? 1 : 0;
    const bVid = b.type === "Vídeo" ? 1 : 0;
    if (aVid !== bVid) return aVid - bVid;
    return 0;
  });
}

export function applyFilter(
  prompts: Prompt[],
  f: Filter,
  favIds: string[]
): Prompt[] {
  const favSet = new Set(favIds);
  switch (f.kind) {
    case "all":
      return sortByReference(prompts);
    case "pov":
      return sortByReference(prompts.filter(isPovPrompt));
    case "favorites":
      return sortByReference(prompts.filter((p) => favSet.has(p.id)));
    case "recommended":
      return sortByReference(prompts.filter((p) => p.recommended));
    case "updates":
      return sortByReference(prompts.filter((p) => p.isNew));
    case "novidades":
      return sortByReference(prompts.filter((p) => p.isNew));
    case "type":
      return sortByReference(prompts.filter((p) => p.type === f.value));
    case "category":
      return sortByReference(prompts.filter((p) => p.category === f.value));
    case "videos-with-ref":
      return sortVideoWithRef(
        prompts.filter((p) => p.type === "Vídeo" && hasWorkingMedia(p))
      );
    case "videos-no-ref":
      return prompts.filter((p) => p.type === "Vídeo" && !hasWorkingMedia(p));

  }
}

export function filterLabel(f: Filter): string {
  switch (f.kind) {
    case "all":
      return "Todos os prompts";
    case "pov":
      return "POV ⭐ Em destaque";
    case "favorites":
      return "Favoritos";
    case "recommended":
      return "Recomendados";
    case "updates":
      return "Atualizações";
    case "novidades":
      return "Novidades";
    case "type":
      return f.value;
    case "category":
      return f.value;
    case "videos-with-ref":
      return "Vídeo";
    case "videos-no-ref":
      return "Vídeos Parte 2";

  }
}
