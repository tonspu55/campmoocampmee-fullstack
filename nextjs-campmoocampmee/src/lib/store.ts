import { create } from "zustand";

interface ScrollState {
  isScrolled: boolean;
  setIsScrolled: (scrolled: boolean) => void;
}

interface GalleryState {
  selectedImageIndex: number | undefined;
  setSelectedImageIndex: (index: number | undefined) => void;
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
