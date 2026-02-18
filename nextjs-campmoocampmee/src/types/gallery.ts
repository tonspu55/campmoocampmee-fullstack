// Shared types for Gallery components
export type GalleryItem = {
  url?: string | null;
  category: string | null;
  alt?: string | null;
  // สำหรับ video embed
  embedCode?: string | null;
  platform?: "youtube" | string | null;
  _type?: "image" | "video";
  title?: string | null;
};

export interface TabGalleryProps {
  dataGallery: GalleryItem[];
  initialImageIndex?: number;
  onTabChange?: () => void;
  slug?: string;
  postTitle?: string;
}

export interface SanityImageItem {
  _type: "image";
  asset?: { url: string };
  category?: string;
  alt?: string;
}

export interface SanityVideoItem {
  _type: "videoUrl";
  url?: string;
  platform?: string;
  category?: string;
  title?: string;
}
