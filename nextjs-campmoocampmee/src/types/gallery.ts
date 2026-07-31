// Shared types for Gallery components

// ── ข้อมูลดิบจาก Sanity (ก่อนผ่าน transformGalleryData) ─────────────

export interface SanityImageItem {
  _key?: string;
  _type: "image";
  asset?: { _id: string; url: string };
  category?: string;
  alt?: string;
}

export interface SanityVideoItem {
  _key?: string;
  _type: "videoUrl";
  url?: string;
  platform?: string;
  category?: string;
  title?: string;
}

/** image item ที่ผ่านการกรองแล้วว่ามี asset ครบ (ใช้กับ urlFor ได้) */
export type ResolvedSanityImage = SanityImageItem & {
  asset: { _id: string; url: string };
};

export const hasImageAsset = (
  item: SanityImageItem,
): item is ResolvedSanityImage => item._type === "image" && !!item.asset?.url;

// ── ข้อมูลที่ component ใช้จริง ────────────────────────────────────

export type VideoPlatform = "youtube" | "tiktok";

export interface GalleryImageItem {
  _type: "image";
  /** `_key` ของ array item ใน Sanity — unique ต่อ post ใช้เป็น React key และ anchor id ได้ */
  _key: string;
  /** ขนาดสำหรับ grid */
  url: string;
  /** ขนาดสำหรับ popup เต็มจอ */
  fullUrl: string;
  category: string;
  alt: string | null;
}

export interface GalleryVideoItem {
  _type: "video";
  _key: string;
  embedUrl: string;
  platform: VideoPlatform;
  category: string;
  title: string | null;
}

export type GalleryItem = GalleryImageItem | GalleryVideoItem;

export const isVideoItem = (item: GalleryItem): item is GalleryVideoItem =>
  item._type === "video";

/** anchor id ของรูปในหน้าอัลบั้ม — หน้า land ลิงก์เข้ามาด้วย hash นี้ */
export const galleryImageAnchorId = (key: string) => `img-${key}`;

export interface TabGalleryProps {
  dataGallery: GalleryItem[];
  slug: string;
  postTitle: string;
}

/** รูปชุดพรีวิว (5 รูปแรก) บนหน้า land */
export interface ImageGalleryItem {
  /** `_key` เดียวกับใน gallery — ใช้ลิงก์ไปยังรูปเดียวกันในหน้าอัลบั้ม */
  key: string;
  url: string;
  alt: string | null;
  title?: string;
}
