import { create } from "zustand";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface ScrollState {
  isScrolled: boolean;
  setIsScrolled: (scrolled: boolean) => void;
}

interface GalleryState {
  selectedImageIndex: number | undefined;
  setSelectedImageIndex: (index: number | undefined) => void;
}

interface LandOwnerPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  thumbnail: SanityImageSource;
  publishedAt: string;
  address: {
    province?: string;
    district?: string;
    subdistrict?: string;
  };
  imageCount: number;
  videoCount: number;
}

interface LandOwnerState {
  posts: LandOwnerPost[];
  providerId: string | null;
  isLandOwner: boolean;
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  fetchPosts: () => Promise<void>;
  reset: () => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  isScrolled: false,
  setIsScrolled: (scrolled: boolean) => set({ isScrolled: scrolled }),
}));

export const useGalleryStore = create<GalleryState>((set) => ({
  selectedImageIndex: undefined,
  setSelectedImageIndex: (index: number | undefined) =>
    set({ selectedImageIndex: index }),
}));

export const useLandOwnerStore = create<LandOwnerState>((set, get) => ({
  posts: [],
  providerId: null,
  isLandOwner: false,
  loading: false,
  error: null,
  hasFetched: false,

  fetchPosts: async () => {
    // ถ้าเคย fetch แล้วและไม่มี error ไม่ต้อง fetch ใหม่
    if (get().hasFetched && !get().error) {
      return;
    }

    const MAX_RETRIES = 2;
    let retryCount = 0;

    const doFetch = async (): Promise<void> => {
      try {
        set({ loading: true, error: null });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch("/api/landowner/posts", {
          signal: controller.signal,
          cache: "no-store",
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "เกิดข้อผิดพลาด");
        }

        const data = await response.json();
        const posts = data.posts || [];
        const providerId = data.providerId || null;
        const isLandOwner = !!(providerId && posts.length > 0);

        set({
          posts,
          providerId,
          isLandOwner,
          loading: false,
          hasFetched: true,
          error: null,
        });
      } catch (err) {
        // Retry on network errors
        if (
          retryCount < MAX_RETRIES &&
          err instanceof Error &&
          (err.name === "AbortError" || err.message.includes("fetch"))
        ) {
          retryCount++;
          console.log(`Retrying... (${retryCount}/${MAX_RETRIES})`);
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount),
          );
          return doFetch();
        }

        let errorMessage = "เกิดข้อผิดพลาด";
        if (err instanceof Error && err.name === "AbortError") {
          errorMessage = "การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง";
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        set({
          loading: false,
          error: errorMessage,
          hasFetched: true,
        });
      }
    };

    await doFetch();
  },

  reset: () => {
    set({
      posts: [],
      providerId: null,
      isLandOwner: false,
      loading: false,
      error: null,
      hasFetched: false,
    });
  },
}));
