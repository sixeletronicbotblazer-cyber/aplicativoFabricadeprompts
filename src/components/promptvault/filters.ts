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
      return Math.min(6, PROMPTS.length);
    case "type":
      return PROMPTS.filter((p) => p.type === f.value).length;
    case "category":
      return PROMPTS.filter((p) => p.category === f.value).length;
  }
}

export function applyFilter(
  prompts: Prompt[],
  f: Filter,
  favIds: string[]
): Prompt[] {
  const favSet = new Set(favIds);
  switch (f.kind) {
    case "all":
      // Stable sort: keep original order, but push video prompts to the end
      // so the "Todos" tab leads with image-based prompts.
      return [...prompts].sort((a, b) => {
        const av = a.type === "Vídeo" ? 1 : 0;
        const bv = b.type === "Vídeo" ? 1 : 0;
        return av - bv;
      });
    case "favorites":
      return prompts.filter((p) => favSet.has(p.id));
    case "recommended":
      return prompts.filter((p) => p.recommended);
    case "updates":
      return [...prompts].reverse().slice(0, 6);
    case "type":
      return prompts.filter((p) => p.type === f.value);
    case "category":
      return prompts.filter((p) => p.category === f.value);
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
