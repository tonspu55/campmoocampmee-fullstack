import { create } from "zustand";

interface ScrollState {
  isScrolled: boolean;
  setIsScrolled: (scrolled: boolean) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  isScrolled: false,
  setIsScrolled: (scrolled: boolean) => set({ isScrolled: scrolled }),
}));
