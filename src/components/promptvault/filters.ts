import {
  PROMPTS,
  type Prompt,
  type PromptCategory,
  type PromptType,
} from "@/lib/prompts";

export type Filter =
  | { kind: "all" }
  | { kind: "type"; value: PromptType }
  | { kind: "category"; value: PromptCategory }
  | { kind: "favorites" }
  | { kind: "recommended" }
  | { kind: "updates" };

export const ALL_FILTER: Filter = { kind: "all" };

/** Stable string key for active-state comparison. */
export function filterKey(f: Filter): string {
  switch (f.kind) {
    case "all":
      return "all";
    case "favorites":
      return "favorites";
    case "recommended":
      return "recommended";
    case "updates":
      return "updates";
    case "type":
      return `type:${f.value}`;
    case "category":
      return `category:${f.value}`;
  }
}

export function countFor(f: Filter, favIds: string[]): number {
  switch (f.kind) {
    case "all":
      return PROMPTS.length;
    case "favorites":
      return favIds.length;
    case "recommended":
      return PROMPTS.filter((p) => p.recommended).length;
    case "updates":
      return PROMPTS.filter((p) => p.isNew).length;
    case "type":
      return PROMPTS.filter((p) => p.type === f.value).length;
    case "category":
      return PROMPTS.filter((p) => p.category === f.value).length;
  }
}

/**
 * Sort helper: prompts WITH reference image → first, WITHOUT → last.
 * Within each group: new items first, then images before videos.
 */
function sortByReference(list: Prompt[]): Prompt[] {
  return [...list].sort((a, b) => {
    // 1. With reference first
    const aRef = a.image ? 0 : 1;
    const bRef = b.image ? 0 : 1;
    if (aRef !== bRef) return aRef - bRef;
    // 2. New items first
    const aNew = a.isNew ? 0 : 1;
    const bNew = b.isNew ? 0 : 1;
    if (aNew !== bNew) return aNew - bNew;
    // 3. Images before videos
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
    case "favorites":
      return sortByReference(prompts.filter((p) => favSet.has(p.id)));
    case "recommended":
      return sortByReference(prompts.filter((p) => p.recommended));
    case "updates":
      return sortByReference(prompts.filter((p) => p.isNew));
    case "type":
      return sortByReference(prompts.filter((p) => p.type === f.value));
    case "category":
      return sortByReference(prompts.filter((p) => p.category === f.value));
  }
}

export function filterLabel(f: Filter): string {
  switch (f.kind) {
    case "all":
      return "Todos os prompts";
    case "favorites":
      return "Favoritos";
    case "recommended":
      return "Recomendados";
    case "updates":
      return "Atualizações";
    case "type":
      return f.value;
    case "category":
      return f.value;
  }
}
