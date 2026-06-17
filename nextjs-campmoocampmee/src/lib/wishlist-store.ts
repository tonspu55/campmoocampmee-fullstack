import { create } from "zustand";
import { toast } from "sonner";

interface WishlistState {
  favoriteIds: Set<string>;
  loading: boolean;
  hasFetched: boolean;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (postId: string) => Promise<void>;
  isFavorite: (postId: string) => boolean;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  favoriteIds: new Set<string>(),
  loading: false,
  hasFetched: false,

  fetchFavorites: async () => {
    if (get().hasFetched) return;

    try {
      set({ loading: true });

      const response = await fetch("/api/wishlist", { cache: "no-store" });

      if (!response.ok) return;

      const data = await response.json();
      set({
        favoriteIds: new Set(data.favoriteIds || []),
        hasFetched: true,
      });
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      set({ loading: false });
    }
  },

  toggleFavorite: async (postId: string) => {
    const { favoriteIds } = get();
    const isFav = favoriteIds.has(postId);

    // Optimistic update
    const newIds = new Set(favoriteIds);
    if (isFav) {
      newIds.delete(postId);
    } else {
      newIds.add(postId);
    }
    set({ favoriteIds: newIds });

    try {
      const response = await fetch("/api/wishlist", {
        method: isFav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update favorite");
      }
    } catch {
      // Revert on failure
      set({ favoriteIds });
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  },

  isFavorite: (postId: string) => {
    return get().favoriteIds.has(postId);
  },

  reset: () => {
    set({
      favoriteIds: new Set<string>(),
      loading: false,
      hasFetched: false,
    });
  },
}));
