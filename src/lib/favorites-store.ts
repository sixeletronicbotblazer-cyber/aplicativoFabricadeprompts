"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => "added" | "removed";
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      isFavorite: (id) => get().ids.includes(id),
      toggle: (id) => {
        const exists = get().ids.includes(id);
        if (exists) {
          set({ ids: get().ids.filter((x) => x !== id) });
          return "removed";
        }
        set({ ids: [...get().ids, id] });
        return "added";
      },
      clear: () => set({ ids: [] }),
    }),
    { name: "promptvault-favorites" }
  )
);
