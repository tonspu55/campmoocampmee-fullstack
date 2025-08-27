// Shared types for Gallery components
export type GalleryItem = {
  url?: string | null;
  category: string | null;
  alt?: string | null;
  // สำหรับ video embed
  embedCode?: string | null;
  platform?: "youtube" | null;
  _type?: "image" | "video";
  title?: string | null;
};

export interface TabGalleryProps {
  dataGallery: GalleryItem[];
  initialImageIndex?: number;
  onTabChange?: () => void;
}

export interface SanityGalleryItem {
  _type: "image" | "video" | "videoUrl";
  asset?: { url: string };
  category?: string;
  alt?: string;
  embedCode?: string;
  platform?: string;
  url?: string;
  title?: string;
}
